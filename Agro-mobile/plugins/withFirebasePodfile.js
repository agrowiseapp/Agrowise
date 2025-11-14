const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withFirebasePodfile(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let podfile = fs.readFileSync(podfilePath, "utf8");

      const postInstallStart = podfile.indexOf("post_install do |installer|");
      if (postInstallStart === -1) {
        console.warn("⚠️ No post_install block found.");
        return config;
      }

      const insertCode = `
    # Firebase non-modular header fix
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_WARN_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'NO'
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'
      end
    end
`;

      // Safely insert before the FIRST closing "end" that closes post_install
      const postInstallEnd = podfile.indexOf("end", postInstallStart);
      podfile =
        podfile.slice(0, postInstallEnd) +
        insertCode +
        podfile.slice(postInstallEnd);

      fs.writeFileSync(podfilePath, podfile);
      console.log("✅ Applied Firebase Podfile fix safely!");

      return config;
    },
  ]);
};
