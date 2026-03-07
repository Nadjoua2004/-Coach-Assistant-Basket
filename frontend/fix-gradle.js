const { withAppBuildGradle, withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Removes 'enableBundleCompression' and forces Kotlin 2.0.21.
 */
function withGradleFixes(config) {
    // Fix App build.gradle
    config = withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = config.modResults.contents.replace(
                /enableBundleCompression = .*/g,
                '// Removed for compatibility'
            );
        }
        return config;
    });

    // Fix Root build.gradle (Force Kotlin version)
    config = withProjectBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            // Force the Kotlin Gradle Plugin version in the buildscript
            config.modResults.contents = config.modResults.contents.replace(
                /classpath\(['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin['"]\)/g,
                "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:2.0.21')"
            );
        }
        return config;
    });

    return config;
}

module.exports = withGradleFixes;
