# Textile Manager - Installation Guide

## System Requirements

- Node.js 16 or higher
- npm (Node Package Manager)
- Database (PostgreSQL, MySQL, or SQLite)

## Installation

### Quick Install (Linux/macOS)

1. Extract the package:
   ```bash
   unzip textile-manager.zip
   cd textile-manager
   ```

2. Run the installation script:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

### Manual Installation

1. Extract the package and navigate to the backend directory:
   ```bash
   unzip textile-manager.zip
   cd textile-manager/backend
   ```

2. Install dependencies:
   ```bash
   npm install --production
   ```

3. Create necessary directories:
   ```bash
   mkdir -p uploads data logs
   ```

4. Start the application:
   ```bash
   npm start
   ```

## Configuration

1. Open your browser and navigate to `http://localhost:3001`
2. Follow the installation wizard to:
   - Configure database connection
   - Create admin user account
   - Set application preferences

## Database Support

The application supports three database types:

### PostgreSQL
- Host, port, database name, username, and password required
- Recommended for production environments

### MySQL
- Host, port, database name, username, and password required
- Good for shared hosting environments

### SQLite
- File path required (created automatically if doesn't exist)
- Perfect for small deployments and testing

## Environment Variables

After installation, you can modify `.env` file to customize:

```env
# Database Configuration
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=textile_manager
DB_USER=your_username
DB_PASSWORD=your_password

# Application Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

## Running as System Service

### Linux (systemd)

1. Copy the service file:
   ```bash
   sudo cp textile-manager.service /etc/systemd/system/
   ```

2. Enable and start the service:
   ```bash
   sudo systemctl enable textile-manager
   sudo systemctl start textile-manager
   ```

3. Check service status:
   ```bash
   sudo systemctl status textile-manager
   ```

### Windows

1. Install as Windows service using PM2:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name textile-manager
   pm2 startup
   pm2 save
   ```

## Backup and Restore

### Database Backup

#### PostgreSQL
```bash
pg_dump -h localhost -U username -d textile_manager > backup.sql
```

#### MySQL
```bash
mysqldump -h localhost -u username -p textile_manager > backup.sql
```

#### SQLite
```bash
cp data/database.sqlite backup_database.sqlite
```

### File Backup
```bash
tar -czf textile_manager_files.tar.gz uploads/
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change PORT in .env file
   - Or stop the process using the port

2. **Database connection failed**
   - Verify database credentials
   - Ensure database server is running
   - Check firewall settings

3. **Permission denied**
   - Ensure proper file permissions
   - Run with appropriate user privileges

### Logs

Application logs are written to:
- Console output (when running directly)
- System logs (when running as service)
- `logs/` directory (if configured)

## Updates

To update the application:

1. Backup your data and configuration
2. Stop the current application
3. Extract new version
4. Run migrations if needed
5. Restart the application

## Support

For support and documentation, visit:
- Application settings page (after installation)
- System logs for error details
- Database logs for database-related issues

## Security Considerations

1. **Change default passwords**
2. **Use HTTPS in production**
3. **Keep the system updated**
4. **Regular database backups**
5. **Restrict file upload types**
6. **Monitor system logs**

## Performance Tuning

1. **Database indexing**: Ensure proper indexes on frequently queried columns
2. **File storage**: Use external storage for large files in production
3. **Caching**: Consider implementing Redis for session storage
4. **Load balancing**: Use nginx or similar for multiple instances