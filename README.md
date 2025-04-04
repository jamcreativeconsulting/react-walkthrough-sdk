# Walkthrough SDK

A React-based SDK for creating interactive walkthroughs and guided tours in web applications.

## Packages

- `@walkthrough-sdk/core`: Core functionality and context provider
- `@walkthrough-sdk/admin`: Admin interface for managing walkthroughs
- `@walkthrough-sdk/admin-playground`: Example implementation of the admin interface

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

1. Build the core and admin packages:
   ```bash
   cd packages/core && npm run build
   cd ../admin && npm run build
   ```

2. Start the admin playground:
   ```bash
   cd examples/admin-playground
   npm install
   npm start
   ```

The playground will be available at `http://localhost:3000`.

## Project Structure

```
walkthrough-sdk/
├── packages/
│   ├── core/           # Core SDK functionality
│   └── admin/          # Admin interface components
├── examples/
│   └── admin-playground/  # Example implementation
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.