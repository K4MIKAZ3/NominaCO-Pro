pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
    components {
        all {
            allVariants {
                withDependencies {
                    removeAll { dep ->
                        dep.group == "org.jetbrains.kotlin" &&
                            (dep.name == "kotlin-stdlib-jdk7" || dep.name == "kotlin-stdlib-jdk8")
                    }
                }
            }
        }
    }
}

rootProject.name = "NominaCO-Pro"
include(":app")
