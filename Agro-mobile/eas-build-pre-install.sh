#!/bin/bash

# EAS Build pre-install hook for iOS
# This script runs before npm/yarn install

echo "🔧 Running EAS Build pre-install hook..."

# For iOS builds only
if [ "$EAS_BUILD_PLATFORM" == "ios" ]; then
  echo "📱 iOS build detected"
  echo "✅ Podfile fix will be applied during pod install"
fi

echo "✅ Pre-install hook completed"
