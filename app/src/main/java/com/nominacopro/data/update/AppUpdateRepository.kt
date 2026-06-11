package com.nominacopro.data.update

import android.content.Context
import com.nominacopro.BuildConfig
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.android.Android
import io.ktor.client.plugins.onDownload
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import kotlinx.serialization.json.Json
import java.io.File
import java.net.URI
import java.security.MessageDigest

class AppUpdateRepository(private val context: Context) {

    private val httpClient = HttpClient(Android)
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun checkForUpdate(): AppUpdateManifest? {
        val manifest = fetchManifest() ?: return null
        return if (manifest.versionCode > BuildConfig.VERSION_CODE) manifest else null
    }

    suspend fun fetchManifest(): AppUpdateManifest? {
        return try {
            val body = httpClient.get(BuildConfig.UPDATE_MANIFEST_URL).bodyAsText()
            val manifest = json.decodeFromString<AppUpdateManifest>(body)
            if (!isAllowedApkUrl(manifest.apkUrl)) null
            else if (manifest.sha256.isBlank()) null
            else manifest
        } catch (_: Exception) {
            null
        }
    }

    suspend fun downloadApk(
        manifest: AppUpdateManifest,
        onProgress: (Float) -> Unit,
    ): File {
        require(isAllowedApkUrl(manifest.apkUrl)) { "URL de APK no permitida" }
        require(manifest.sha256.isNotBlank()) { "Manifiesto sin checksum SHA-256" }

        val destination = File(context.cacheDir, "nominapp-update.apk")
        if (destination.exists()) {
            destination.delete()
        }

        val bytes = httpClient.get(manifest.apkUrl) {
            onDownload { bytesSentTotal, contentLength ->
                if (contentLength != null && contentLength > 0L) {
                    onProgress((bytesSentTotal.toFloat() / contentLength.toFloat()).coerceIn(0f, 1f))
                }
            }
        }.body<ByteArray>()

        destination.writeBytes(bytes)
        onProgress(1f)

        val actual = sha256Hex(destination)
        val expected = manifest.sha256.lowercase()
        if (actual != expected) {
            destination.delete()
            throw SecurityException("Checksum del APK no coincide")
        }

        return destination
    }

    fun close() {
        httpClient.close()
    }

    companion object {
        private val ALLOWED_APK_HOST_SUFFIXES = listOf(
            "github.com",
            "githubusercontent.com",
        )

        fun isAllowedApkUrl(url: String): Boolean {
            val host = URI(url).host?.lowercase() ?: return false
            return ALLOWED_APK_HOST_SUFFIXES.any { suffix ->
                host == suffix || host.endsWith(".$suffix")
            }
        }

        fun sha256Hex(file: File): String {
            val digest = MessageDigest.getInstance("SHA-256")
            file.inputStream().use { input ->
                val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
                var read = input.read(buffer)
                while (read >= 0) {
                    if (read > 0) digest.update(buffer, 0, read)
                    read = input.read(buffer)
                }
            }
            return digest.digest().joinToString("") { byte -> "%02x".format(byte) }
        }
    }
}
