const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

async function packageApplication() {
  console.log('Packaging application...');

  try {
    // Create package directory
    const packageDir = path.join(__dirname, '../../package');
    await fs.promises.mkdir(packageDir, { recursive: true });

    // Create archive
    const output = fs.createWriteStream(path.join(packageDir, 'textile-manager.zip'));
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Package created: ${archive.pointer()} total bytes`);
      console.log('Application packaged successfully');
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);

    // Add frontend build
    const frontendBuildPath = path.join(__dirname, '../../dist');
    if (fs.existsSync(frontendBuildPath)) {
      archive.directory(frontendBuildPath, 'frontend');
    }

    // Add backend
    const backendPath = path.join(__dirname, '../');
    archive.directory(backendPath, 'backend', {
      ignore: ['node_modules/**', 'dist/**', '.git/**', '*.log']
    });

    // Add installation files
    archive.file(path.join(__dirname, 'install.sh'), { name: 'install.sh' });
    archive.file(path.join(__dirname, 'README.md'), { name: 'README.md' });

    await archive.finalize();
  } catch (error) {
    console.error('Packaging failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  packageApplication();
}

module.exports = { packageApplication };