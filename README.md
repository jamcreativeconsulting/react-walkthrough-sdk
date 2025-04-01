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
- 💾 Self-hosted backend with SQLite storage
- 🔒 User progress tracking
- 🚀 Easy deployment

## Project Structure

The project is organized as a monorepo with the following packages:

### Frontend (`packages/frontend`)
- React components for walkthrough UI
- State management
- API integration

### Backend (`packages/backend`)
- SQLite database integration
- RESTful API endpoints
- Repository pattern for data access
- User progress tracking
- Walkthrough management

## Installation

```bash
# Install dependencies for all packages
npm install

# Build all packages
npm run build
```

## Backend Development

The backend is built with Node.js and uses SQLite for data storage. It implements a repository pattern for clean data access.

### Database Schema

The backend uses two main tables:
- `walkthroughs`: Stores walkthrough definitions and metadata
- `user_progress`: Tracks user completion status for walkthroughs

### Repositories

- `WalkthroughRepository`: Manages CRUD operations for walkthroughs
- `UserProgressRepository`: Handles user progress tracking and updates

### Running Backend Tests

```bash
cd packages/backend
npm test
```

## Frontend Development

```bash
cd packages/frontend
npm run dev
```

## API Documentation

### Walkthrough Endpoints

```typescript
// Create a new walkthrough
POST /api/walkthroughs
Body: {
  name: string;
  steps: WalkthroughStep[];
  metadata?: Record<string, any>;
}

// Get all walkthroughs
GET /api/walkthroughs

// Get walkthrough by ID
GET /api/walkthroughs/:id

// Update walkthrough
PUT /api/walkthroughs/:id

// Delete walkthrough
DELETE /api/walkthroughs/:id
```

### User Progress Endpoints

```typescript
// Get user progress
GET /api/progress/:userId

// Update user progress
PUT /api/progress/:userId/:walkthroughId
Body: {
  completed: boolean;
  currentStep: number;
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub repository](https://github.com/yourusername/react-walkthrough-sdk/issues).