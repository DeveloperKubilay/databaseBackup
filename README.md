# Database Backup Utility 🚀

## Overview 📖
This project is a database backup utility designed to automate the process of creating, uploading, and managing database backups. It uses AWS S3-compatible storage for storing backups securely.

## Features 🌟
- **Backup Creation**: Automatically generates database backups using `pg_dump`.
- **Backup Upload**: Uploads backups to an S3-compatible storage.
- **Backup Management**: Deletes old backups to maintain storage limits.
- **Restore Functionality**: Restores backups using `pg_restore`.

## Prerequisites ✅
1. **Node.js**: Ensure Node.js is installed on your system.
2. **Environment Variables**: Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_USERNAME=your_db_username
   DATABASE_PASSWORD=your_db_password
   DATABASE_NAME=your_db_name
   R2_URL=your_s3_endpoint
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   Size=your_storage_limit
   ```

## Installation 🛠️
1. Clone the repository:
   ```bash
   git clone https://github.com/DeveloperKubilay/databaseBackup.git
   ```
2. Navigate to the project directory:
   ```bash
   cd databaseBackup
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage 🚀
### Backup
Run the following command to create and upload a backup:
```bash
node index.js
```

### Restore
Use the `restore.sh` script to restore a backup:
```bash
sh module/restore.sh
```

## Command Line Arguments 🖥️

The script supports the following command-line arguments:

- **`upload`**: Executes the backup process and uploads the backup file to the S3-compatible storage.
  ```bash
  node index.js upload
  ```

- **`restore`**: Restores the most recent backup from the S3-compatible storage.
  ```bash
  node index.js restore
  ```

- **Default Behavior**: If no arguments are provided, the script runs the backup process at regular intervals (default: 1 hour).
  ```bash
  node index.js
  ```

## File Structure 📂
- `index.js`: Main script for backup operations.
- `module/backup.sh`: Script for creating backups.
- `module/restore.sh`: Script for restoring backups.
- `module/s3.js`: Handles S3 operations (upload, list, delete).
- `module/temp/`: Temporary directory for backup files.

## Dependencies 📦
- `@aws-sdk/client-s3`: AWS SDK for S3 operations.
- `dotenv`: Loads environment variables from `.env` file.

## License 📜
This project is licensed under the ISC License.
