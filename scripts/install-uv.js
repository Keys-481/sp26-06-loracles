/**
 * Downloads and installs uv for the current platform
 */
const https = require('https');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const UV_VERSION = '0.11.2';
const UV_BASE_URL = `https://github.com/astral-sh/uv/releases/download/${UV_VERSION}`;

async function uvFetchAndInstall() {
  const platform = process.platform;
  const arch = process.arch;

  let filename;
  let binaryName = 'uv';

  // Set platform-specific variables
  if (platform === 'win32') {
    binaryName = 'uv.exe';
    if (arch === 'x64') {
      filename = 'uv-x86_64-pc-windows-msvc.zip';
    } else {
      throw new Error(`Unsupported Windows architecture: ${arch}`);
    }
  } else if (platform === 'darwin') {
    if (arch === 'x64') {
      filename = 'uv-x86_64-apple-darwin.tar.gz';
    } else if (arch === 'arm64') {
      filename = 'uv-aarch64-apple-darwin.tar.gz';
    } else {
      throw new Error(`Unsupported macOS architecture: ${arch}`);
    }
  } else if (platform === 'linux') {
    if (arch === 'x64') {
      filename = 'uv-x86_64-unknown-linux-gnu.tar.gz';
    } else if (arch === 'arm64') {
      filename = 'uv-aarch64-unknown-linux-gnu.tar.gz';
    } else {
      throw new Error(`Unsupported Linux architecture: ${arch}`);
    }
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  let resourcesDir = path.join(__dirname, '..', 'resources');
  let uvDir = path.join(resourcesDir, 'uv');
  let binaryPath = path.join(uvDir, binaryName);

  if (await fs.pathExists(binaryPath)) {
    console.log('uv already installed, skipping download.');
    return binaryPath;
  }

  // Ensure uv directory exists before trying to install uv binaries under it
  await fs.ensureDir(uvDir);
  let archivePath = path.join(uvDir, filename);

  // Download uv
  let url = `${UV_BASE_URL}/${filename}`;
  console.log(`Downloading uv from ${url}...`);
  await new Promise((resolve, reject) => {
    let file = fs.createWriteStream(archivePath);
    https.get(url, { headers: {'User-Agent': 'electron-forge' } }, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }
    }).on('error', (err) => {
      fs.unlink(archivePath, () => reject(err));
    });
  });

  // Extract uv to archive path
  console.log('Extracting uv...');
  if (filename.endsWith('.zip')) {
    execSync(`powershell -command "Expand-Archive -Path '${archivePath}' -DestinationPath '${uvDir}' -Force"`, {
      stdio: 'inherit',
    });
  } else {
    execSync(`tar -xzf "${archivePath}" -C "${uvDir}"`, {
      stdio: 'inherit',
    });
  }

  // Ensure that binary was properly installed or exists where expected
  let extractedBinaryPath = path.join(uvDir, binaryName);
  let possiblePaths = [
    extractedBinaryPath,
    path.join(uvDir, 'uv', binaryName),
    path.join(uvDir, `uv-${process.arch}`, binaryName),
  ];

  let foundBinary = false;
  for (let possiblePath of possiblePaths) {
    if (await fs.pathExists(possiblePath)) {
      if (possiblePath !== extractedBinaryPath) {
        await fs.move(possiblePath, extractedBinaryPath, { overwrite: true });
      }
      foundBinary = true;
      break;
    }
  }

  if (!foundBinary) {
    throw new Error('Could not find uv binary in extracted archive');
  }

  // Make uv executable for macOS/Linux platforms
  if (process.platform !== 'win32') {
    execSync(`chmod +x "${extractedBinaryPath}"`);
  }

  // Cleanup
  await fs.remove(archivePath);
  const extractedDirs = await fs.readdir(uvDir);
  for (const item of extractedDirs) {
    const itemPath = path.join(uvDir, item);
    const stat = await fs.stat(itemPath);
    if (stat.isDirectory()) {
      await fs.remove(itemPath);
    }
  }

  console.log(`uv installed to ${extractedBinaryPath}`);
  return extractedBinaryPath;
}

if (require.main === module) {
  uvFetchAndInstall()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Failed to download uv:', err);
      process.exit(1);
    });
}

module.exports = { uvFetchAndInstall };
