module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      // SDK version settings - CRITICAL for Play Store
      minSdkVersion: 24,
      compileSdkVersion: 36,
      targetSdkVersion: 36,
      // Enable 16KB page size support for newer Android devices
      // This is required for Android 15+ devices with 16KB page size
      config: {
        pageSize: '16KB',
      },
      // Additional optimization settings
      enableProguardInReleaseBuilds: true,
      enableShrinkResourcesInReleaseBuilds: true,
    },
    // Add custom gradle properties for 16KB support
    plugins: [
      ...config.plugins,
      [
        'expo-build-properties',
        {
          android: {
            // Enable 16KB page size alignment in native builds
            usesCleartextTraffic: false,
            // Set minSdkVersion to 24 (required by React Native libraries)
            minSdkVersion: 24,
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            // Add JVM options for better memory alignment
            packagingOptions: {
              pickFirst: ['**/libc++_shared.so'],
            },
          },
        },
      ],
    ],
  };
};
