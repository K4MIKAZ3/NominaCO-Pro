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

class AppUpdateRepository(private val context: Context) {

    private val httpClient = HttpClient(Android)
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun checkForUpdate(): AppUpdateManifest? {
        val manifest = fetchManifest() ?: return null
        return if (manifest.versionCode > BuildConfig.VERSION_CODE) manifest else null
    }

    suspend fun fetchManifest(): AppUpdateManifest? = try {
        val body = httpClient.get(BuildConfig.UPDATE_MANIFEST_URL).bodyAsText()
        json.decodeFromString<AppUpdateManifest>(body)
    } catch (_: Exception) {
        null
    }

    suspend fun downloadApk(
        manifest: AppUpdateManifest,
        onProgress: (Float) -> Unit,
    ): File {
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
        return destination
    }

    fun close() {
        httpClient.close()
    }
}
