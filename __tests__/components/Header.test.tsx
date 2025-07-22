import { render, screen } from '@testing-library/react';
import Header from '@/app/components/Header';

describe('Header', () => {
  it('renders header with app name', () => {
    const handleDrawerToggle = jest.fn();
    render(<Header handleDrawerToggle={handleDrawerToggle} />);

    expect(screen.getByText('AcuaSaaS')).toBeInTheDocument();
  });

  it('calls handleDrawerToggle when menu button is clicked', () => {
    const handleDrawerToggle = jest.fn();
    render(<Header handleDrawerToggle={handleDrawerToggle} />);

    const menuButton = screen.getByLabelText('メニュー');
    menuButton.click();

    expect(handleDrawerToggle).toHaveBeenCalledTimes(1);
  });
});
