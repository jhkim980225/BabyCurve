import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DevInfo } from './DevInfo';

describe('DevInfo', () => {
  it('renders heading, size comparison, and milestone text for week 12', () => {
    render(<DevInfo week={12} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Week 12');
    // size comparison sentence
    expect(screen.getByText(/your baby is about the size of/i)).toBeInTheDocument();
    // milestone should be a non-empty sentence
    const milestone = screen.getByTestId('dev-milestone');
    expect(milestone.textContent).toBeTruthy();
  });

  it('renders nothing for week 3 (out of range)', () => {
    const { container } = render(<DevInfo week={3} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for week 41 (above range)', () => {
    const { container } = render(<DevInfo week={41} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the glass-card wrapper for a valid week', () => {
    const { container } = render(<DevInfo week={20} />);
    expect(container.querySelector('.glass-card')).not.toBeNull();
  });
});
