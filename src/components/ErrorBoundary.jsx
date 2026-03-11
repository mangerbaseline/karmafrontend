import React from "react";

function makeErrorId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorId: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, errorId: makeErrorId() };
  }

  componentDidCatch(error, info) {
    // Minimal observability hook (upgrade later to Sentry)
    try {
      console.error("[KREMA_UI_ERROR]", { errorId: this.state.errorId, error, info });
    } catch {
      // ignore
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-600">
              The app hit an unexpected error. Try reloading the page.
            </p>

            <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
              <div className="font-semibold">Error ID</div>
              <div className="mt-1 font-mono">{this.state.errorId}</div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Reload
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorId: null })}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
              >
                Try to continue
              </button>
            </div>

            <details className="mt-5">
              <summary className="cursor-pointer text-sm text-gray-700">Technical details</summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-gray-50 p-3 text-[11px] text-gray-700">
{String(this.state.error?.stack || this.state.error || "")}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
