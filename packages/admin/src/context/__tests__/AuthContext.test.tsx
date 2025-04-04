import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const TestComponent = () => {
  const { state, login, logout, setApiKey } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">
        {state.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-email">{state.user?.email}</div>
      <div data-testid="api-key">{state.user?.apiKey}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => setApiKey('new-api-key')}>Set API Key</button>
    </div>
  );
};

const TestComponentWithoutProvider = () => {
  useAuth();
  return <div>Test</div>;
};

describe('AuthContext', () => {
  it('provides initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-email')).toBeEmptyDOMElement();
    expect(screen.getByTestId('api-key')).toBeEmptyDOMElement();
  });

  it('handles login and logout', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login
    fireEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('api-key')).toHaveTextContent('mock-api-key');
    });

    // Logout
    fireEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-email')).toBeEmptyDOMElement();
    expect(screen.getByTestId('api-key')).toBeEmptyDOMElement();
  });

  it('updates API key', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login first
    fireEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('api-key')).toHaveTextContent('mock-api-key');
    });

    // Update API key
    fireEvent.click(screen.getByText('Set API Key'));
    expect(screen.getByTestId('api-key')).toHaveTextContent('new-api-key');
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
