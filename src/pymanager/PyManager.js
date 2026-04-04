import { app } from 'electron';
import path from 'node:path';
import fse from 'fs-extra';
import { spawn } from 'node:child_process';

const PYTHON_VERSION = '3.13';

class PyManager {
  get _resourcesPath() {
    return app.isPackaged
      ? path.join(process.resourcesPath, 'app.asar.unpacked', 'resources')
      : path.join(__dirname, '..', '..', 'resources');
  }

  get _uvPath() {
    return path.join(
      this._resourcesPath,
      'uv',
      process.platform === 'win32' ? 'uv.exe' : 'uv'
    );
  }

  get _venvPath() {
    return path.join(app.getPath('userData'), 'python', 'base-venv');
  }

  get pythonPath() {
    return path.join(
      this._venvPath,
      process.platform === 'win32' ? 'Scripts\\python.exe' : 'bin/python'
    );
  }

  // Ensure base venv exists
  // Installs requirements for any models already in modelsDir
  async initialize(modelsDir) {
    if (!(await fse.pathExists(this._uvPath))) {
      throw new Error(`uv binary not found at ${this._uvPath}`);
    }

    if (!(await fse.pathExists(this.pythonPath))) {
      await fse.ensureDir(path.dirname(this._venvPath));
      await this._run(this._uvPath, ['venv', '--clear', this._venvPath, '--python', PYTHON_VERSION]);
    }

    await this._installBaseRequirements();
    await this._installModelRequirements(modelsDir);
    await this._installTorch();
  }

  // Runs a command and returns stdout as a string. Never rejects — returns null on failure.
  _capture(bin, args) {
    return new Promise((resolve) => {
      const proc = spawn(bin, args, { stdio: ['ignore', 'pipe', 'ignore'] });
      let out = '';
      proc.stdout.on('data', (d) => out += d);
      proc.on('close', (code) => resolve(code === 0 ? out : null));
      proc.on('error', () => resolve(null));
    });
  }

  async _detectCudaTag() {
    const out = await this._capture('nvidia-smi', []);
    if (!out) return null;
    const m = out.match(/CUDA Version:\s*(\d+)\.(\d+)/);
    if (!m) return null;
    const [major, minor] = [parseInt(m[1]), parseInt(m[2])];
    console.log(`[pymanager] nvidia-smi reports CUDA ${major}.${minor}`);
    if (major > 12 || (major === 12 && minor >= 4)) return 'cu124';
    if (major === 12 && minor >= 1) return 'cu121';
    if (major === 11 && minor >= 8) return 'cu118';
    console.log('[pymanager] CUDA version too old for supported PyTorch wheels — falling back to CPU');
    return null;
  }

  async _detectRocmTag() {
    // rocminfo on Linux, hipinfo on Windows
    const cmd = process.platform === 'win32' ? 'hipinfo' : 'rocminfo';
    const out = await this._capture(cmd, []);
    if (!out) return null;
    console.log('[pymanager] ROCm detected');
    return 'rocm6.2';
  }

  // Returns true if torch+torchvision are already installed with GPU support (or any version on macOS).
  async _isGpuTorchInstalled() {
    const [torchOut, tvOut] = await Promise.all([
      this._capture(this._uvPath, ['pip', 'show', 'torch', '--python', this.pythonPath]),
      this._capture(this._uvPath, ['pip', 'show', 'torchvision', '--python', this.pythonPath]),
    ]);
    if (!torchOut || !tvOut) return false;
    if (process.platform === 'darwin') return true;
    const torchVersion = torchOut.match(/^Version:\s*(.+)$/m)?.[1] ?? '';
    const tvVersion = tvOut.match(/^Version:\s*(.+)$/m)?.[1] ?? '';
    return /\+(cu|rocm)/.test(torchVersion) && /\+(cu|rocm)/.test(tvVersion);
  }

  async _installTorch() {
    if (await this._isGpuTorchInstalled()) {
      console.log('[pymanager] GPU torch already installed -- skipping');
      return;
    }

    if (process.platform === 'darwin') {
      // Default PyPI torch includes MPS support on Apple Silicon
      console.log('[pymanager] macOS -- installing default torch (MPS built-in)');
      await this._run(this._uvPath, ['pip', 'install', 'torch', 'torchvision', '--python', this.pythonPath]);
      return;
    }

    const cudaTag = await this._detectCudaTag();
    const gpuTag = cudaTag ?? await this._detectRocmTag();

    if (gpuTag) {
      const indexUrl = `https://download.pytorch.org/whl/${gpuTag}`;
      console.log(`[pymanager] Installing torch with ${gpuTag}`);
      try {
        await this._run(this._uvPath, [
          'pip', 'install', 'torch', 'torchvision',
          '--reinstall-package', 'torch',
          '--reinstall-package', 'torchvision',
          '--index-url', indexUrl,
          '--python', this.pythonPath,
        ]);
        return;
      } catch (err) {
        console.warn(`[pymanager] GPU torch install failed: ${err.message}`);
        console.warn('[pymanager] Falling back to CPU torch');
      }
    }

    console.log('[pymanager] Installing CPU torch');
    await this._run(this._uvPath, [
      'pip', 'install', 'torch', 'torchvision',
      '--reinstall-package', 'torch',
      '--reinstall-package', 'torchvision',
      '--index-url', 'https://download.pytorch.org/whl/cpu',
      '--python', this.pythonPath,
    ]);
  }

  get _baseRequirementsPath() {
    return app.isPackaged
      ? path.join(this._resourcesPath, 'pymanager', 'requirements.txt')
      : path.join(__dirname, '..', '..', 'src', 'pymanager', 'requirements.txt');
  }

  async _installBaseRequirements() {
    console.log('Installing base requirements...');
    await this._run(this._uvPath, ['pip', 'install', '-r', this._baseRequirementsPath, '--python', this.pythonPath]);
  }

  async _installModelRequirements(modelsDir) {
    if (!(await fse.pathExists(modelsDir))) return;

    const entries = await fse.readdir(modelsDir);
    for (const entry of entries) {
      const reqFile = path.join(modelsDir, entry, 'requirements.txt');
      if (await fse.pathExists(reqFile)) {
        console.log(`Installing requirements from ${reqFile}`);
        await this._run(this._uvPath, ['pip', 'install', '-r', reqFile, '--python', this.pythonPath]);
      }
    }
  }

  _run(bin, args) {
    return new Promise((resolve, reject) => {
      const proc = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      proc.stdout.on('data', (d) => process.stdout.write(`[uv] ${d}`));
      proc.stderr.on('data', (d) => process.stderr.write(`[uv] ${d}`));
      proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${path.basename(bin)} exited with code ${code}`)));
      proc.on('error', reject);
    });
  }
}

export default new PyManager();
