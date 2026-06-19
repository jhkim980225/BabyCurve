import { describe, it, expect } from 'vitest';
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
