import React from 'react';
import { render, screen } from '@testing-library/react';
import { PositionTest } from '../../stories/PositionTest';

describe('PositionTest', () => {
  it('renders with top position', () => {
    render(<PositionTest position="top" />);
    expect(screen.getByText('Position Testing: top')).toBeInTheDocument();
    expect(screen.getByText('Top Target')).toBeInTheDocument();
  });

  it('renders with right position', () => {
    render(<PositionTest position="right" />);
    expect(screen.getByText('Position Testing: right')).toBeInTheDocument();
    expect(screen.getByText('Right Target')).toBeInTheDocument();
  });

  it('renders with bottom position', () => {
    render(<PositionTest position="bottom" />);
    expect(screen.getByText('Position Testing: bottom')).toBeInTheDocument();
    expect(screen.getByText('Bottom Target')).toBeInTheDocument();
  });

  it('renders with left position', () => {
    render(<PositionTest position="left" />);
    expect(screen.getByText('Position Testing: left')).toBeInTheDocument();
    expect(screen.getByText('Left Target')).toBeInTheDocument();
  });

  it('renders all target buttons', () => {
    render(<PositionTest position="top" />);
    expect(screen.getByText('Top Target')).toBeInTheDocument();
    expect(screen.getByText('Right Target')).toBeInTheDocument();
    expect(screen.getByText('Bottom Target')).toBeInTheDocument();
    expect(screen.getByText('Left Target')).toBeInTheDocument();
  });
}); 