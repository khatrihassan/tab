import { createBrowserRouter, Navigate } from 'react-router';
import { GuestLayout } from './context/GuestProvider';
import { DevComponents } from './screens/DevComponents';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/t/demo" replace /> },
  {
    path: '/t/:tableToken',
    element: <GuestLayout />,
    children: [],
  },
  { path: '/dev/components', element: <DevComponents /> },
]);
