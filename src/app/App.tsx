import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { Toaster, Button } from '@/components/ui';
import { KitchenSink } from './routes/KitchenSink';

export function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/dev/kitchen-sink" element={<KitchenSink />} />
        <Route
          path="*"
          element={
            <main className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6 text-center space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight">Northstar</h1>
              <p className="text-text-2 max-w-md">
                Personal operating system: life areas → goals → OKRs → projects → tasks → daily
                planning → habits → reviews.
              </p>
              <div className="pt-4">
                <Link to="/dev/kitchen-sink">
                  <Button variant="primary">Open Component Kitchen Sink</Button>
                </Link>
              </div>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
