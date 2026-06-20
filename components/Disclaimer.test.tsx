import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Disclaimer } from './Disclaimer';

describe('Disclaimer', () => {
  it('renders and contains "not medical advice"', () => {
    render(<Disclaimer />);
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
  });

  it('renders the full disclaimer text about consulting a healthcare provider', () => {
    render(<Disclaimer />);
    expect(screen.getByText(/consult your healthcare provider/i)).toBeInTheDocument();
  });
});
