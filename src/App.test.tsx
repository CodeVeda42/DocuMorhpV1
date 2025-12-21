import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Smoke Test', () => {
  it('renders the landing page by default', () => {
    render(<App />);
    // Check for the main headline on the landing page
    expect(screen.getByText(/Stop Formatting Manually/i)).toBeInTheDocument();
  });

  it('contains the navigation buttons', () => {
    render(<App />);
    // Check for the "Get Started" button
    const getStartedButtons = screen.getAllByText(/Get Started/i);
    expect(getStartedButtons.length).toBeGreaterThan(0);
  });
});
