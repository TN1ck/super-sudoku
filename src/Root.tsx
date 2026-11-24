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
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-center dark:bg-gray-700">
            <div className="mb-4 text-6xl text-red-500">⚠️</div>
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              We're sorry, but something unexpected happened. Please report the bug on Github and describe what you did
              to have it happen.
            </p>
            <div className="space-y-3">
              <a
                href={`https://github.com/TN1ck/super-sudoku/issues/new?title=Bug%20report%20from%20sudoku.tn1ck.com&body=error%20details%3A%0A%0A${encodedError}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-800"
              >
                Report Bug on GitHub
              </a>
              <button
                onClick={() => window.location.reload()}
                type="button"
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
            {error && (
              <div className="mt-4 text-left">
                <h2 className="font-bold text-gray-900 dark:text-white">Error Details</h2>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs text-gray-900 dark:bg-gray-800 dark:text-gray-100">
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
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);

export default App;
