import * as React from "react";

import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from "@tanstack/react-router";

import {ThemeProvider} from "./context/ThemeContext";
import Game, {AppProvider} from "./pages/Game";
import SelectGame from "./pages/SelectGame";

const rootRoute = createRootRoute({
  component: () => (
    <AppProvider>
      <Outlet />
    </AppProvider>
  ),
});

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Game,
});

const selectGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/select-game",
  component: SelectGame,
});

rootRoute.addChildren([gameRoute, selectGameRoute]);

const hashHistory = createHashHistory();

function RedirectToGame() {
  const {search} = useLocation();
  return <Navigate to="/" search={search} replace />;
}

const router = createRouter({
  routeTree: rootRoute,
  defaultNotFoundComponent: RedirectToGame,
  history: hashHistory,
  parseSearch: (searchStr) => Object.fromEntries(new URLSearchParams(searchStr)),
  stringifySearch: (search) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
    const serialized = params.toString();
    return serialized ? `?${serialized}` : "";
  },
});

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, info.componentStack);
  }

  handleWindowError = (event: ErrorEvent) => {
    if (!event.error && (!event.message || event.message.startsWith("ResizeObserver loop"))) {
      return;
    }
    const error = event.error instanceof Error ? event.error : new Error(event.message || "Unexpected error");
    console.error("Error caught by boundary:", error);
    this.setState({hasError: true, error});
  };

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    console.error("Unhandled promise rejection:", event.reason);
    this.setState({hasError: true, error});
  };

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  render() {
    const {hasError, error} = this.state;
    if (hasError) {
      const encodedError = encodeURIComponent(error?.toString() ?? "Unknown error");
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 text-center shadow-lg">
            <div className="mb-4 text-6xl text-danger">⚠️</div>
            <h1 className="mb-4 text-2xl font-bold text-ink">Something went wrong</h1>
            <p className="mb-6 text-ink-muted">
              We're sorry, but something unexpected happened. Please report the bug on Github and describe what you did
              to have it happen.
            </p>
            <div className="space-y-3">
              <a
                href={`https://github.com/TN1ck/super-sudoku/issues/new?title=Bug%20report%20from%20sudoku.tn1ck.com&body=error%20details%3A%0A%0A${encodedError}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-md border border-border bg-button px-4 py-2 text-button-text transition-colors hover:bg-button-hover"
              >
                Report Bug on GitHub
              </a>
              <button
                onClick={() => window.location.reload()}
                type="button"
                className="w-full rounded-md bg-accent px-4 py-2 text-accent-text transition-colors hover:bg-accent-hover"
              >
                Refresh Page
              </button>
            </div>
            {error && (
              <div className="mt-4 text-left">
                <h2 className="font-bold text-ink">Error Details</h2>
                <pre className="mt-2 overflow-auto rounded bg-surface-subtle p-2 text-xs text-ink">
                  {error.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => (
  <ThemeProvider>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </ThemeProvider>
);

export default App;
