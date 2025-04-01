# React Walkthrough SDK

A powerful and flexible SDK for creating interactive walkthroughs in React applications. This SDK allows you to create guided tours, feature introductions, and onboarding experiences with ease.

## Features

- 🎯 Easy element targeting
- 🎨 Customizable popover design
- 🔄 Flexible flow management
- 👨‍💼 Admin interface for walkthrough creation
- ♿ Accessibility support
- 📱 Responsive design
- 🔄 Drag-and-drop flow editing

## Installation

```bash
npm install react-walkthrough-sdk
```

## Quick Start

```javascript
import { WalkthroughSDK } from 'react-walkthrough-sdk';

// Initialize the SDK
const walkthrough = new WalkthroughSDK({
  target: '#app',
  mode: 'presentation'
});

// Define your walkthrough flow
const flow = [
  {
    targetId: 'user-profile',
    content: 'Click here to view your profile',
    position: 'bottom'
  },
  {
    targetId: 'settings-btn',
    content: 'Access your settings here',
    position: 'right'
  }
];

// Start the walkthrough
walkthrough.start(flow);
```

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/react-walkthrough-sdk.git
cd react-walkthrough-sdk
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Documentation

For detailed documentation, please visit our [documentation site](https://docs.react-walkthrough-sdk.com).

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub repository](https://github.com/yourusername/react-walkthrough-sdk/issues). 