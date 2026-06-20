import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputForm } from './InputForm';

describe('InputForm', () => {
  it('calls onCalculate with parsed values', async () => {
    const onCalculate = vi.fn();
    render(<InputForm onCalculate={onCalculate} />);

    await userEvent.type(screen.getByLabelText(/weeks/i), '30');
    await userEvent.type(screen.getByLabelText(/days/i), '2');
    await userEvent.type(screen.getByLabelText(/measurement/i), '1500');
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(onCalculate).toHaveBeenCalledWith({
      standardId: 'who',
      metricId: 'efw',
      weeks: 30,
      days: 2,
      value: 1500,
    });
  });

  it('shows a validation error for an empty measurement', async () => {
    const onCalculate = vi.fn();
    render(<InputForm onCalculate={onCalculate} />);

    await userEvent.type(screen.getByLabelText(/weeks/i), '30');
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByText(/enter a measurement/i)).toBeInTheDocument();
    expect(onCalculate).not.toHaveBeenCalled();
  });
});
