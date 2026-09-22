module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
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
            // Ensure the app is compatible with 16KB page size
            minSdkVersion: 21,
            compileSdkVersion: 34,
            targetSdkVersion: 34,
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
