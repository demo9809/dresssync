const fs = require('fs').promises;
const path = require('path');

async function buildBackend() {
  console.log('Building backend...');
  
  try {
    // Create dist directory
    const distDir = path.join(__dirname, '../dist');
    await fs.mkdir(distDir, { recursive: true });
    
    // Copy source files (in a real scenario, you might use Babel or TypeScript)
    const srcDir = path.join(__dirname, '../src');
    await copyDirectory(srcDir, path.join(distDir, 'src'));
    
    // Copy package.json
    await fs.copyFile(
      path.join(__dirname, '../package.json'),
      path.join(distDir, 'package.json')
    );
    
    // Create production start script
    const startScript = `#!/usr/bin/env node
require('./src/index.js');
`;
    
    await fs.writeFile(path.join(distDir, 'start.js'), startScript);
    
    console.log('Backend build completed successfully');
  } catch (error) {
    console.error('Backend build failed:', error);
    process.exit(1);
  }
}

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

if (require.main === module) {
  buildBackend();
}

module.exports = { buildBackend };