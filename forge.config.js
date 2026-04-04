const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { resolve, join, dirname } = require('path');
const { copy, mkdirs } = require('fs-extra');
const { uvFetchAndInstall } = require('./scripts/install-uv');

/**
 * Native modules to pack in the built version
 * ZeroMQ requires cmake-ts and node-addon-api
 */
const requiredPackages = ['zeromq', 'cmake-ts', 'node-addon-api'];

module.exports = {
  packagerConfig: {
    asar: {
      unpackDir: 'resources',
    },
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
    generateAssets: async () => {
      await uvFetchAndInstall();
    },

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
      const destResourcesPath = join(buildPath, "resources");

      const uvSource = resolve(".", "resources", "uv");
      if (await require('fs-extra').pathExists(uvSource)) {
        await copy(uvSource, join(destResourcesPath, "uv"), { recursive: true, preserveTimestamps: true });
      } else {
        console.warn('uv binary not found — generateAssets should have downloaded it. Check your build.');
      }

      await mkdirs(join(destResourcesPath, "pymanager"));
      await copy(
        resolve(".", "src", "pymanager", "requirements.txt"),
        join(destResourcesPath, "pymanager", "requirements.txt")
      );

      const pythonSrcDest = join(destResourcesPath, "python", "src");
      await mkdirs(pythonSrcDest);
      await copy(resolve(".", "src", "__init__.py"), join(pythonSrcDest, "__init__.py"));
      await copy(
        resolve(".", "src", "inference"),
        join(pythonSrcDest, "inference"),
        { recursive: true, preserveTimestamps: true }
      );
    }
  }
};
