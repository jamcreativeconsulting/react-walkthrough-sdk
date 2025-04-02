# React Walkthrough SDK

A powerful and flexible walkthrough system for React applications.

## Quick Start

### Backend Setup

The Walkthrough SDK includes a self-hosted backend with SQLite storage. To set it up:

```bash
# Install the setup tool globally
npm install -g create-walkthrough-backend

# Run the setup wizard
create-walkthrough-backend
```

The setup wizard will guide you through:
- Project configuration
- Database setup
- Security settings
- Environment configuration

For detailed setup instructions, see the [Backend Setup Guide](packages/create-walkthrough-backend/README.md).

### Frontend Integration

1. Install the SDK:
```bash
npm install @walkthrough-sdk/react
```

2. Initialize the SDK in your app:
```javascript
import { WalkthroughProvider } from '@walkthrough-sdk/react';

function App() {
  return (
    <WalkthroughProvider
      apiUrl="http://localhost:3000"
      apiKey="your-api-key"
    >
      {/* Your app components */}
    </WalkthroughProvider>
  );
}
```

## Features

- Interactive walkthroughs
- Self-hosted backend
- SQLite storage
- Backup and restore
- Analytics tracking
- User progress management

## Documentation

- [Backend Setup](packages/create-walkthrough-backend/README.md)
- [Component Registry](COMPONENTS.md)
- [Development Guide](DEVELOPMENT.md)
- [API Reference](docs/api.md)

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for development setup and guidelines.

## License

ISC