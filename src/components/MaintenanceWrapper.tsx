'use client';

import { useMaintenanceMode } from '../contexts/SettingsContext';
import MaintenanceMode from './MaintenanceMode';
import { usePathname } from 'next/navigation';

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

const MaintenanceWrapper: React.FC<MaintenanceWrapperProps> = ({ children }) => {
  const isMaintenanceMode = useMaintenanceMode();
  const pathname = usePathname();

  // Allow admin access even during maintenance
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Always allow access to maintenance page itself
  const isMaintenancePage = pathname === '/maintenance';

  // Show maintenance mode if enabled, but allow admin and maintenance page access
  if (isMaintenanceMode && !isAdminRoute && !isMaintenancePage) {
    return <MaintenanceMode />;
  }

  return <>{children}</>;
};

export default MaintenanceWrapper;
