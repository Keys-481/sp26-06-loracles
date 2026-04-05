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

  async _installTorch() {
    await this._run(this._uvPath, [
      'pip', 'install', 'torch', 'torchvision',
      '--reinstall-package', 'torch',
      '--reinstall-package', 'torchvision',
      '--torch-backend=auto',
      '--python', this.pythonPath,
    ]);
  }

  get _baseRequirementsPath() {
    return app.isPackaged
      ? path.join(this._resourcesPath, 'pymanager', 'requirements.txt')
      : path.join(__dirname, '..', '..', 'src', 'pymanager', 'requirements.txt');
  }

  async _installBaseRequirements() {
    console.log('[pymanager] Installing base requirements...');
    await this._run(this._uvPath, ['pip', 'install', '-r', this._baseRequirementsPath, '--python', this.pythonPath]);
  }

  async _installModelRequirements(modelsDir) {
    if (!(await fse.pathExists(modelsDir))) return;

    const entries = await fse.readdir(modelsDir);
    for (const entry of entries) {
      const reqFile = path.join(modelsDir, entry, 'requirements.txt');
      if (await fse.pathExists(reqFile)) {
        console.log(`[pymanager] Installing requirements from ${reqFile}`);
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
