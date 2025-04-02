# Walkthrough SDK Backend Setup Wizard

A one-command setup tool for the Walkthrough SDK backend. This tool helps you quickly set up a self-hosted backend for the Walkthrough SDK with SQLite storage.

## Installation

```bash
npm install -g create-walkthrough-backend
```

## Usage

Run the setup wizard:

```bash
create-walkthrough-backend
```

## Setup Process

The wizard will guide you through the following steps:

### 1. Project Configuration
- **Project Name**: Name of your project (default: 'walkthrough-backend')
- **Port**: Port number for the backend server (default: 3000)

### 2. Database Configuration
- **Database Path**: Location to store the SQLite database file (default: './data/walkthrough.db')
- **Backup Path**: Location to store database backups (default: './data/backups')

### 3. Security Configuration
- **API Key**: Your API key for authentication (leave empty to generate one)
- **Allowed Origins**: Comma-separated list of allowed origins for CORS (default: '*')

### 4. Database Initialization
- Creates the SQLite database
- Sets up all required tables
- Configures indexes for optimal performance

## Generated Files

After setup, the following files and directories will be created:

```
your-project/
├── .env                  # Environment configuration
├── data/
│   ├── walkthrough.db    # SQLite database
│   └── backups/          # Database backups
└── package.json          # Project dependencies
```

## Environment Variables

The setup wizard creates a `.env` file with the following variables:

```env
PROJECT_NAME=your-project-name
PORT=3000
DATABASE_PATH=./data/walkthrough.db
BACKUP_PATH=./data/backups
API_KEY=your-api-key
ALLOWED_ORIGINS=*
```

## Features

- **Interactive Setup**: Step-by-step configuration process
- **Auto-Configuration**: Automatic generation of API keys and default settings
- **Database Setup**: Automatic creation of SQLite database with proper schema
- **Backup System**: Built-in backup and restore functionality
- **Security**: Configurable API keys and CORS settings

## Requirements

- Node.js 14 or higher
- npm 6 or higher
- Write permissions in the installation directory

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure you have write permissions in the installation directory
   - Run the wizard with appropriate permissions

2. **Database Initialization Failed**
   - Check if the database directory exists and is writable
   - Verify SQLite is properly installed

3. **API Key Issues**
   - If you lose your API key, you'll need to generate a new one
   - Keep your API key secure and don't share it

### Getting Help

If you encounter any issues, please:
1. Check the error message for details
2. Verify all requirements are met
3. Contact support if the issue persists

## Next Steps

After setup, you can:
1. Start the backend server
2. Configure your frontend to use the backend
3. Create your first walkthrough

## License

ISC 