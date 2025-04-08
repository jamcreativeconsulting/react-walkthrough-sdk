import React from 'react';
import { WalkthroughProvider, useWalkthrough } from '../context/WalkthroughContext';
import { AuthProvider } from '../context/AuthContext';
import { PointAndClickEditor } from '../components/PointAndClickEditor/PointAndClickEditor';
import './App.css';

const TestArea: React.FC = () => {
  const { state } = useWalkthrough();
  const currentWalkthrough = state.currentWalkthrough;

  return (
    <div className="test-area">
      <h2>Test Area</h2>
      <p>Click elements below to create walkthrough steps:</p>

      <div className="test-elements">
        <button id="test-button" className="primary-button">
          Test Button
        </button>

        <div id="test-card" className="card">
          <h3>Test Card</h3>
          <p>This is a test card with some content.</p>
          <a href="#" className="card-link">
            Learn More
          </a>
        </div>

        <form className="test-form">
          <div className="form-group">
            <label htmlFor="test-input">Test Input</label>
            <input
              type="text"
              id="test-input"
              className="form-control"
              placeholder="Enter some text"
            />
          </div>

          <div className="form-group">
            <label htmlFor="test-select">Test Select</label>
            <select id="test-select" className="form-control">
              <option value="">Select an option</option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
            </select>
          </div>
        </form>

        <div className="test-tooltip" data-tooltip="This is a tooltip">
          Hover over me
        </div>
      </div>

      {currentWalkthrough && currentWalkthrough.steps.length > 0 && (
        <div className="steps-preview">
          <h3>Created Steps</h3>
          <div className="steps-list">
            {currentWalkthrough.steps.map((step, index) => (
              <div key={step.id} className="step-preview-item">
                <h4>{step.title || `Step ${index + 1}`}</h4>
                <p>{step.content}</p>
                <div className="step-target">Target: {step.targetElement}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const handleStepCreated = (step: any) => {
    console.log('Step created:', step);
  };

  const handleStepUpdated = (step: any) => {
    console.log('Step updated:', step);
  };

  const handleStepDeleted = (stepId: string) => {
    console.log('Step deleted:', stepId);
  };

  return (
    <AuthProvider>
      <WalkthroughProvider>
        <div className="playground">
          <header className="playground-header">
            <h1>Point-and-Click Editor Playground</h1>
          </header>

          <main className="playground-content">
            <div className="editor-container">
              <PointAndClickEditor />
            </div>

            <TestArea />
          </main>

          <footer className="playground-footer">
            <p>Use this playground to test the Point-and-Click Editor functionality.</p>
          </footer>
        </div>
      </WalkthroughProvider>
    </AuthProvider>
  );
};

export default App;
