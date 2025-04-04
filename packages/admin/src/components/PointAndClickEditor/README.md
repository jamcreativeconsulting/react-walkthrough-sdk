# Point-and-Click Editor Component

The Point-and-Click Editor is a powerful tool for creating interactive walkthroughs by allowing users to select elements on a page and create steps associated with those elements.

## Features

- **Element Selection**: Click and select any element on the page
- **Smart Selector Generation**: Automatically generates unique CSS selectors for selected elements
- **Step Creation**: Create new steps with selected elements
- **Preview Mode**: Toggle between edit and preview modes
- **Visual Feedback**: Clear visual indicators for selected elements

## Usage

```tsx
import { PointAndClickEditor } from './PointAndClickEditor';

const MyComponent = () => {
  const handleStepCreated = step => {
    console.log('New step created:', step);
  };

  return (
    <PointAndClickEditor
      onStepCreated={handleStepCreated}
      onStepUpdated={handleStepUpdated}
      onStepDeleted={handleStepDeleted}
    />
  );
};
```

## Props

| Prop            | Type                       | Description                               |
| --------------- | -------------------------- | ----------------------------------------- |
| `onStepCreated` | `(step: Step) => void`     | Callback fired when a new step is created |
| `onStepUpdated` | `(step: Step) => void`     | Callback fired when a step is updated     |
| `onStepDeleted` | `(stepId: string) => void` | Callback fired when a step is deleted     |

## Dependencies

- React
- WalkthroughContext
- AuthContext
- ApiClientImpl

## Implementation Details

### Element Selection

The editor uses a combination of mouse events to handle element selection:

- `mouseover` for visual feedback
- `click` for final selection

### Selector Generation

The `getElementSelector` function generates unique CSS selectors by:

1. Checking for element IDs
2. Using class names
3. Looking for unique attributes
4. Falling back to nth-child selectors

### Step Creation

Steps are created with the following properties:

- `title`: Default title for the step
- `content`: Default content for the step
- `target`: Generated CSS selector for the element
- `order`: Position in the walkthrough sequence

## Styling

The component uses CSS modules for styling. Key styles include:

- Visual feedback for selected elements
- Toolbar with action buttons
- Step preview section
- Responsive layout

## Error Handling

The component includes error handling for:

- API calls
- Element selection
- Step creation
- Authentication state

## Best Practices

1. Always check authentication state before creating steps
2. Use the preview mode to verify element selection
3. Test selectors in different contexts to ensure uniqueness
4. Handle edge cases in element selection
