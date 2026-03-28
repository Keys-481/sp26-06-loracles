const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { resolve, join, dirname } = require('path');
const { copy, mkdirs } = require('fs-extra');

/** 
 * Native modules to pack in the built version 
 * ZeroMQ requires cmake-ts and node-addon-api 
 */
const requiredPackages = ['zeromq', 'cmake-ts', 'node-addon-api'];

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: 'src/main.js',
            config: 'vite.main.config.mjs',
            target: 'main',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs',
            target: 'preload',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  hooks: {
    // Copies requiredPackages into the output build
    packageAfterCopy: async (_forgeConfig, buildPath) => {

      const sourceModulesPath = resolve(".", "node_modules");
      const destModulesPath = resolve(buildPath, "node_modules");

      await Promise.all(
        requiredPackages.map(async (pkgName) => {
          const sourcePkgPath = join(sourceModulesPath, pkgName);
          const destPkgPath = join(destModulesPath, pkgName);

          await mkdirs(dirname(destPkgPath));
          await copy(sourcePkgPath, destPkgPath, {
            recursive: true,
            preserveTimestamps: true
          });
        })
      );
    }
  }
};
