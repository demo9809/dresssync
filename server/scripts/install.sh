#!/bin/bash

echo "Textile Manager Installation Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm."
    exit 1
fi

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
echo ""

# Create application directory
APP_DIR="textile-manager"
if [ -d "$APP_DIR" ]; then
    echo "Directory $APP_DIR already exists. Please remove it or choose a different location."
    exit 1
fi

mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Extract application files
echo "Extracting application files..."
if [ -f "../textile-manager.zip" ]; then
    unzip -q "../textile-manager.zip"
else
    echo "textile-manager.zip not found. Please ensure the package file is in the same directory."
    exit 1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install --production

# Create necessary directories
mkdir -p uploads
mkdir -p data
mkdir -p logs

# Set permissions
chmod +x scripts/install.sh

# Create systemd service file (optional)
if command -v systemctl &> /dev/null; then
    echo "Creating systemd service..."
    cat > textile-manager.service << EOF
[Unit]
Description=Textile Manager Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(which node) src/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    echo "To install as system service, run:"
    echo "sudo cp textile-manager.service /etc/systemd/system/"
    echo "sudo systemctl enable textile-manager"
    echo "sudo systemctl start textile-manager"
fi

echo ""
echo "Installation completed!"
echo "====================="
echo ""
echo "Next steps:"
echo "1. Start the application: npm start"
echo "2. Open your browser and go to http://localhost:3001"
echo "3. Follow the installation wizard to configure the database and create admin user"
echo ""
echo "The application will serve both the API and frontend."
echo "Default port: 3001 (can be changed in .env file)"
echo ""