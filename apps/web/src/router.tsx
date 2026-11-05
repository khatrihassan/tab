import { createBrowserRouter, Navigate } from 'react-router';
import { GuestLayout } from './context/GuestProvider';
import { DevComponents } from './screens/DevComponents';
import { Bill } from './screens/guest/Bill';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/t/demo" replace /> },
  {
    path: '/t/:tableToken',
    element: <GuestLayout />,
    children: [{ index: true, element: <Bill /> }],
  },
  { path: '/dev/components', element: <DevComponents /> },
]);
