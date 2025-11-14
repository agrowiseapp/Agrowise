#!/bin/bash

# EAS Build post-install hook
# This runs after npm/yarn install but before the actual build

echo "🔧 Running EAS Build post-install hook..."

# Only run for iOS builds
if [ "$EAS_BUILD_PLATFORM" == "ios" ]; then
  echo "📱 iOS build detected - Applying Firebase fix..."

  # Navigate to iOS directory
  cd ios

  # Install pods
  echo "📦 Installing CocoaPods..."
  pod install --repo-update

  # Apply the fix to Pods project using Ruby
  echo "🔧 Applying CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES fix..."

  ruby -e "
  require 'xcodeproj'

  project_path = 'Pods/Pods.xcodeproj'
  project = Xcodeproj::Project.open(project_path)

  project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      puts \"✅ Applied fix to #{target.name} - #{config.name}\"
    end
  end

  project.save
  puts '✅ Successfully applied Firebase fix to all targets!'
  "

  cd ..
  echo "✅ iOS post-install hook completed!"
else
  echo "⏩ Skipping iOS-specific fixes for non-iOS build"
fi

echo "✅ Post-install hook completed"
