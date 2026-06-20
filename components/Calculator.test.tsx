import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

describe('Calculator page', () => {
  it('shows a result card after entering values and calculating', async () => {
    render(<Home />);
    await userEvent.type(screen.getByLabelText(/weeks/i), '30');
    await userEvent.type(screen.getByLabelText(/measurement/i), '1525');
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByText(/percentile/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /growth chart/i })).toBeInTheDocument();
  });
});

describe('Calculator page — history', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows measurement in history list after saving', async () => {
    render(<Home />);

    // Fill form and calculate
    await userEvent.type(screen.getByLabelText(/weeks/i), '30');
    await userEvent.type(screen.getByLabelText(/measurement/i), '1525');
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    // Should see the history panel with Save button
    expect(screen.getByRole('button', { name: /save to history/i })).toBeInTheDocument();

    // Save the measurement
    await userEvent.click(screen.getByRole('button', { name: /save to history/i }));

    // Measurement should appear in the history list (weeks=30)
    expect(screen.getByText(/30w/)).toBeInTheDocument();
    expect(screen.getByText(/1525/)).toBeInTheDocument();
  });

  it('clears history when Clear all is clicked', async () => {
    render(<Home />);

    await userEvent.type(screen.getByLabelText(/weeks/i), '30');
    await userEvent.type(screen.getByLabelText(/measurement/i), '1525');
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await userEvent.click(screen.getByRole('button', { name: /save to history/i }));

    // Measurement is in the list
    expect(screen.getByText(/1525/)).toBeInTheDocument();

    // Clear it
    await userEvent.click(screen.getByRole('button', { name: /clear all/i }));

    // History item is gone
    expect(screen.queryByText(/1525/)).not.toBeInTheDocument();
  });
});
