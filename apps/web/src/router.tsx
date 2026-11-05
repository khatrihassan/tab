import type { Bill } from '@tab/shared';
import { createBrowserRouter } from 'react-router';

// Typed with a shared type to prove the @tab/shared link works.
const placeholderTitle: Bill['restaurantName'] = 'Tab.';

// Placeholder route — real screens come later.
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <main className="flex min-h-svh items-center justify-center">
        <h1 className="text-4xl font-bold">{placeholderTitle}</h1>
      </main>
    ),
  },
]);
