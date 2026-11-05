import { createBrowserRouter, Navigate } from 'react-router';
import { GuestLayout } from './context/GuestProvider';
import { DevComponents } from './screens/DevComponents';
import { Bill } from './screens/guest/Bill';
import { Choose } from './screens/guest/Choose';
import { Done } from './screens/guest/Done';
import { Items } from './screens/guest/Items';
import { Pay } from './screens/guest/Pay';
import { SplitEqual } from './screens/guest/SplitEqual';
import { Tip } from './screens/guest/Tip';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/t/demo" replace /> },
  {
    path: '/t/:tableToken',
    element: <GuestLayout />,
    children: [
      { index: true, element: <Bill /> },
      { path: 'choose', element: <Choose /> },
      { path: 'split', element: <SplitEqual /> },
      { path: 'items', element: <Items /> },
      { path: 'tip', element: <Tip /> },
      { path: 'pay', element: <Pay /> },
      { path: 'done', element: <Done /> },
    ],
  },
  { path: '/dev/components', element: <DevComponents /> },
]);
