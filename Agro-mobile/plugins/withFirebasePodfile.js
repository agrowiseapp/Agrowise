const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Custom Expo config plugin to fix Firebase + iOS compatibility
 * Adds Clang build settings to allow non-modular header includes
 */
module.exports = function withFirebasePodfile(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );

      let podfileContent = fs.readFileSync(podfilePath, "utf-8");

      // Check if our fix is already applied
      if (
        podfileContent.includes(
          "CLANG_WARN_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES"
        )
      ) {
        console.log(
          "✅ Firebase Podfile fix already applied, skipping..."
        );
        return config;
      }

      // Find the post_install block and add our fix
      const postInstallRegex = /(post_install do \|installer\|[\s\S]*?)(  end\nend)/;

      if (postInstallRegex.test(podfileContent)) {
        podfileContent = podfileContent.replace(
          postInstallRegex,
          `$1
    # Fix for Firebase non-modular header includes
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_WARN_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'NO'
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'
      end
    end

$2`
        );

        fs.writeFileSync(podfilePath, podfileContent);
        console.log("✅ Applied Firebase Podfile fix successfully!");
      } else {
        console.warn(
          "⚠️  Could not find post_install block in Podfile"
        );
      }

      return config;
    },
  ]);
};
