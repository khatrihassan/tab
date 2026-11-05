import { createBrowserRouter } from 'react-router';

// Placeholder route — real screens come later.
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <main className="flex min-h-svh items-center justify-center">
        <h1 className="text-4xl font-bold">Tab.</h1>
      </main>
    ),
  },
]);
