import React, { useEffect } from 'react';
import { useWalkthrough } from '@walkthrough-sdk/core';
import './styles.css';

const log = (message: string, data?: any) => {
  console.log(`[AdminPanel] ${message}`, data ? data : '');
};

const logError = (message: string, error: any) => {
  console.error(`[AdminPanel] ${message}`, error);
};

export const AdminPanel: React.FC = () => {
  try {
    const { isAdmin, setIsAdmin, currentStep, setCurrentStep, totalSteps, setTotalSteps } =
      useWalkthrough();

    useEffect(() => {
      log('Component mounted');
      return () => {
        log('Component unmounted');
      };
    }, []);

    const handleAddStep = () => {
      try {
        log('Adding step', { currentTotal: totalSteps });
        setTotalSteps(totalSteps + 1);
      } catch (error) {
        logError('Error adding step', error);
      }
    };

    const handleRemoveStep = () => {
      try {
        if (totalSteps > 0) {
          log('Removing step', { currentTotal: totalSteps });
          setTotalSteps(totalSteps - 1);
          if (currentStep >= totalSteps - 1) {
            setCurrentStep(totalSteps - 2);
          }
        }
      } catch (error) {
        logError('Error removing step', error);
      }
    };

    return (
      <div className="admin-panel">
        <h2>Walkthrough Admin Panel</h2>

        <div className="admin-controls">
          <button onClick={() => setIsAdmin(!isAdmin)}>
            {isAdmin ? 'Disable Admin Mode' : 'Enable Admin Mode'}
          </button>

          <div className="step-controls">
            <button onClick={handleAddStep}>Add Step</button>
            <button onClick={handleRemoveStep}>Remove Step</button>
          </div>

          <div className="step-info">
            <p>Current Step: {currentStep + 1}</p>
            <p>Total Steps: {totalSteps}</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    logError('Component Error', error);
    return (
      <div className="admin-panel error">
        <h2>Error Loading Admin Panel</h2>
        <p>Please check the console for details.</p>
      </div>
    );
  }
};
