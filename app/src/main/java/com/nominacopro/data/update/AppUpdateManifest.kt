package com.nominacopro.data.update

import kotlinx.serialization.Serializable

@Serializable
data class AppUpdateManifest(
    val versionCode: Int,
    val versionName: String,
    val apkUrl: String,
    val releaseNotes: String = "",
)
