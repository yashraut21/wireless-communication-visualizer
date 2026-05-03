import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function RootLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-primary)' }}>
      <Navbar />

      <div className="flex flex-1 pt-16">
        {/* Sidebar only on non-home pages */}
        {!isHome && <Sidebar />}

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer
        className="py-8 mt-auto"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              <span className="gradient-text font-semibold">Wireless Comms Visualized</span>
              {' '}— An interactive learning experience
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Based on Rappaport's "Wireless Communications: Principles and Practice"
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
