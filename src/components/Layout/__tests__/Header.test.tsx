
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from '../Header';
import { ThemeProvider } from '../../../contexts/ThemeContext';

const MockedHeader = ({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) => (
    <ThemeProvider>
        <Header collapsed={collapsed} onToggle={onToggle} />
    </ThemeProvider>
);

describe('Header', () => {
    it('renders header with title', () => {
        const mockToggle = jest.fn();
        render(<MockedHeader collapsed={false} onToggle={mockToggle} />);

        expect(screen.getByText('E-commerce CMS')).toBeInTheDocument();
    });

    it('calls onToggle when menu button is clicked', () => {
        const mockToggle = jest.fn();
        render(<MockedHeader collapsed={false} onToggle={mockToggle} />);

        const menuButton = screen.getByRole('button', { name: /fold/i });
        fireEvent.click(menuButton);

        expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('shows correct icon based on collapsed state', () => {
        const mockToggle = jest.fn();
        const { rerender } = render(<MockedHeader collapsed={false} onToggle={mockToggle} />);

        expect(screen.getByRole('button', { name: /fold/i })).toBeInTheDocument();

        rerender(<MockedHeader collapsed={true} onToggle={mockToggle} />);
        expect(screen.getByRole('button', { name: /unfold/i })).toBeInTheDocument();
    });
});