# React Walkthrough SDK Components

This document tracks all components in the React Walkthrough SDK project.

## Core Components

### WalkthroughSDK

- **Location**: `src/core/WalkthroughSDK.js`
- **Usage**: Main entry point for the SDK
- **Dependencies**: None
- **Special Considerations**:
  - Handles initialization and configuration
  - Manages walkthrough state
  - Coordinates between components

### EventManager

- **Location**: `src/core/EventManager.js`
- **Usage**: Manages event handling across the SDK
- **Dependencies**: None
- **Special Considerations**:
  - Handles DOM events
  - Manages custom events
  - Coordinates event propagation

## UI Components

### Popover

- **Location**: `src/components/Popover/index.js`
- **Usage**: Displays walkthrough content
- **Dependencies**: None
- **Special Considerations**:
  - Handles positioning
  - Manages animations
  - Implements accessibility features

### AdminInterface

- **Location**: `src/components/AdminInterface/index.js`
- **Usage**: Provides admin controls for creating walkthroughs
- **Dependencies**: Popover
- **Special Considerations**:
  - Element selection tool
  - Content editor
  - Flow management

### FlowManager

- **Location**: `src/components/FlowManager/index.js`
- **Usage**: Manages walkthrough flow and sequence
- **Dependencies**: Popover
- **Special Considerations**:
  - Step sequencing
  - Progress tracking
  - Flow validation

## Backend Components

### WalkthroughRepository

- **Location**: `packages/backend/src/db/repositories/WalkthroughRepository.ts`
- **Usage**: Manages walkthrough data in SQLite database
- **Dependencies**: SQLite
- **Special Considerations**:
  - CRUD operations for walkthroughs
  - Data validation
  - Error handling

### UserProgressRepository

- **Location**: `packages/backend/src/db/repositories/UserProgressRepository.ts`
- **Usage**: Manages user progress data
- **Dependencies**: SQLite
- **Special Considerations**:
  - Progress tracking
  - User state management
  - Data consistency

### Database Schema

- **Location**: `packages/backend/src/db/schema.ts`
- **Usage**: Defines database structure
- **Dependencies**: None
- **Special Considerations**:
  - Table definitions
  - Relationships
  - Migrations

## Utility Components

### Positioning

- **Location**: `src/utils/positioning.js`
- **Usage**: Handles popover positioning logic
- **Dependencies**: None
- **Special Considerations**:
  - Calculates optimal position
  - Handles viewport boundaries
  - Manages responsive positioning

### FlowControl

- **Location**: `src/utils/flowControl.js`
- **Usage**: Manages walkthrough flow logic
- **Dependencies**: None
- **Special Considerations**:
  - Step transitions
  - Flow validation
  - State management

## Component Updates Log

### 2024-04-01

- Added backend components
- Implemented SQLite database integration
- Created WalkthroughRepository and UserProgressRepository
- Added database schema

### 2024-03-19

- Initial project setup
- Created component registry
- Defined core component structure

# Component Registry

## Core Package

### WalkthroughProvider

- **Location**: `packages/core/src/WalkthroughProvider.tsx`
- **Usage**: Root component that provides walkthrough context to the application
- **Dependencies**: React Context API
- **Special Considerations**: Must be the root component of any application using the SDK

## Admin Package

### AdminPanel

- **Location**: `packages/admin/src/AdminPanel.tsx`
- **Usage**: Main admin interface component
- **Dependencies**:
  - WalkthroughProvider
  - React Router (if implemented)
- **Special Considerations**: Requires WalkthroughProvider as parent

## Playground

### App

- **Location**: `examples/admin-playground/src/index.tsx`
- **Usage**: Example implementation of the admin interface
- **Dependencies**:
  - WalkthroughProvider
  - AdminPanel
- **Special Considerations**: Used for development and testing purposes

## PointAndClickEditor

**File Location:** `packages/admin/src/components/PointAndClickEditor/PointAndClickEditor.tsx`

**Usage Locations:**

- Admin Panel for creating and editing walkthrough steps
- Walkthrough creation interface
- Step management interface

**Special Considerations:**

- Requires authentication context
- Uses WalkthroughContext for state management
- Generates unique CSS selectors for elements
- Handles element selection and step creation
- Provides visual feedback during element selection

**Dependencies:**

- React
- WalkthroughContext
- AuthContext
- ApiClientImpl
- CSS Modules

**Props:**

- `onStepCreated`: Callback for step creation
- `onStepUpdated`: Callback for step updates
- `onStepDeleted`: Callback for step deletion

**Documentation:**

- See `packages/admin/src/components/PointAndClickEditor/README.md` for detailed documentation
