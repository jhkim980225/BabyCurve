import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EfwEstimator } from './EfwEstimator';

async function openPanel() {
  // The panel starts collapsed — click the toggle button
  await userEvent.click(screen.getByRole('button', { name: /estimate efw from biometrics/i }));
}

describe('EfwEstimator', () => {
  it('renders collapsed by default (inputs not visible)', () => {
    render(<EfwEstimator onEstimated={vi.fn()} />);
    expect(screen.queryByLabelText(/bpd/i)).not.toBeInTheDocument();
  });

  it('expands when the panel header is clicked', async () => {
    render(<EfwEstimator onEstimated={vi.fn()} />);
    await openPanel();
    expect(screen.getByLabelText(/bpd/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hc/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ac/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fl/i)).toBeInTheDocument();
  });

  it('shows an error when Estimate EFW is clicked with incomplete inputs', async () => {
    render(<EfwEstimator onEstimated={vi.fn()} />);
    await openPanel();
    // Type only BPD — leave the rest blank
    await userEvent.type(screen.getByLabelText(/bpd/i), '8.7');
    await userEvent.click(screen.getByRole('button', { name: /^estimate efw$/i }));
    expect(screen.getByText(/enter all four measurements/i)).toBeInTheDocument();
  });

  it('shows estimated weight and fires onEstimated with the correct grams', async () => {
    const onEstimated = vi.fn();
    render(<EfwEstimator onEstimated={onEstimated} />);
    await openPanel();

    await userEvent.type(screen.getByLabelText(/bpd/i), '8.7');
    await userEvent.type(screen.getByLabelText(/hc/i), '31');
    await userEvent.type(screen.getByLabelText(/ac/i), '30');
    await userEvent.type(screen.getByLabelText(/fl/i), '6.5');
    await userEvent.click(screen.getByRole('button', { name: /^estimate efw$/i }));

    // Hadlock formula with bpd=8.7, hc=31, ac=30, fl=6.5 → ~2331 g
    expect(screen.getByText(/estimated weight:.*2331.*g/i)).toBeInTheDocument();
    expect(onEstimated).toHaveBeenCalledOnce();
    expect(onEstimated).toHaveBeenCalledWith(2331);
  });

  it('does not fire onEstimated when inputs are incomplete', async () => {
    const onEstimated = vi.fn();
    render(<EfwEstimator onEstimated={onEstimated} />);
    await openPanel();

    await userEvent.type(screen.getByLabelText(/bpd/i), '8.7');
    await userEvent.click(screen.getByRole('button', { name: /^estimate efw$/i }));

    expect(onEstimated).not.toHaveBeenCalled();
  });
});
