import { Link } from 'react-router-dom';
import { SignInForm } from '../components/SignInForm';
import { CelestialGuidance } from '../components/CelestialGuidance';

export function SignInPage() {
  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-bg selection:bg-highlight selection:text-bg">
      {/* Left Form Section */}
      <section
        className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 min-h-screen"
        data-purpose="auth-form-column"
      >
        {/* Top Brand Header */}
        <header className="flex items-center justify-between" data-purpose="brand-header">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group focus:outline-none focus:ring-1 focus:ring-highlight rounded p-1"
          >
            {/* Geometric Northstar Logo Mark */}
            <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center transition-colors group-hover:border-highlight shadow-sm">
              <svg
                className="w-4 h-4 text-highlight"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold tracking-tight text-text text-base">Northstar</span>
              <span className="font-mono text-xs uppercase tracking-widest text-text-2 font-medium">
                OS v2.4
              </span>
            </div>
          </Link>
        </header>

        {/* Center Content */}
        <SignInForm />

        {/* Bottom System Status Footer */}
        <footer
          className="text-[11px] text-text-3 flex justify-between items-center"
          data-purpose="column-footer"
        >
          <span className="font-mono">SYS.STATUS: OPERATIONAL</span>
          <span>Secure Telemetry Auth</span>
        </footer>
      </section>

      {/* Right Visual Brand Column */}
      <CelestialGuidance />
    </main>
  );
}
