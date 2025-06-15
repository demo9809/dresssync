const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function buildProject() {
  console.log('🚀 Starting build process...');

  try {
    // Build frontend
    console.log('📦 Building frontend...');
    await execCommand('npm run build');

    // Build backend
    console.log('🔧 Building backend...');
    await execCommand('cd server && npm run build');

    // Create release directory
    const releaseDir = path.join(__dirname, '../release');
    await fs.mkdir(releaseDir, { recursive: true });

    // Copy frontend build
    console.log('📁 Copying frontend build...');
    await execCommand(`cp -r dist ${releaseDir}/frontend`);

    // Copy backend
    console.log('📁 Copying backend...');
    await execCommand(`cp -r server ${releaseDir}/backend`);

    // Create start script
    const startScript = `#!/bin/bash
echo "Starting Textile Manager..."

# Start backend
cd backend
npm start &
BACKEND_PID=$!

# Serve frontend (you can use nginx or any static server)
echo "Backend started with PID: $BACKEND_PID"
echo "Frontend is available in the frontend directory"
echo "Setup complete! Access the application at http://localhost:3001"

# Wait for backend process
wait $BACKEND_PID
`;

    await fs.writeFile(path.join(releaseDir, 'start.sh'), startScript);
    await execCommand(`chmod +x ${releaseDir}/start.sh`);

    // Create README
    const readme = `# Textile Manager - Production Build

## Quick Start

1. Ensure Node.js 16+ is installed
2. Run: \`./start.sh\`
3. Open browser to http://localhost:3001/install
4. Follow the installation wizard

## Manual Setup

### Backend
\`\`\`bash
cd backend
npm install --production
npm start
\`\`\`

### Frontend
The frontend is pre-built and served by the backend server.

## Configuration

After running the installation wizard, you can modify the \`.env\` file in the backend directory to customize settings.

## Requirements

- Node.js 16 or higher
- Database (PostgreSQL, MySQL, or SQLite)
- 512MB RAM minimum
- 1GB disk space

## Support

Check the logs directory for troubleshooting information.
`;

    await fs.writeFile(path.join(releaseDir, 'README.md'), readme);

    console.log('✅ Build completed successfully!');
    console.log(`📁 Release files are in: ${releaseDir}`);

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        console.log(stderr);
      }
      if (stdout) {
        console.log(stdout);
      }
      resolve(stdout);
    });
  });
}

if (require.main === module) {
  buildProject();
}

module.exports = { buildProject };