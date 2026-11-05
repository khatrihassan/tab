import { createBrowserRouter, Navigate } from 'react-router';
import { GuestLayout } from './context/GuestProvider';
import { DevComponents } from './screens/DevComponents';
import { Bill } from './screens/guest/Bill';
import { Choose } from './screens/guest/Choose';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/t/demo" replace /> },
  {
    path: '/t/:tableToken',
    element: <GuestLayout />,
    children: [
      { index: true, element: <Bill /> },
      { path: 'choose', element: <Choose /> },
    ],
  },
  { path: '/dev/components', element: <DevComponents /> },
]);
