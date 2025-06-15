const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { buildProject } = require('./build');

async function packageProject() {
  console.log('📦 Starting packaging process...');

  try {
    // First build the project
    await buildProject();

    // Create package
    const packageDir = path.join(__dirname, '../packages');
    await fs.promises.mkdir(packageDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const packageName = `textile-manager-${timestamp}.zip`;
    const packagePath = path.join(packageDir, packageName);

    console.log('🗜️  Creating package archive...');

    const output = fs.createWriteStream(packagePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log('✅ Package created successfully!');
        console.log(`📦 Package: ${packagePath}`);
        console.log(`📊 Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
        resolve(packagePath);
      });

      archive.on('error', reject);
      archive.pipe(output);

      // Add release files
      const releaseDir = path.join(__dirname, '../release');
      archive.directory(releaseDir, false);

      archive.finalize();
    });

  } catch (error) {
    console.error('❌ Packaging failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  packageProject();
}

module.exports = { packageProject };