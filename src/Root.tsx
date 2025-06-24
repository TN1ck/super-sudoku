import * as React from "react";

import {createRootRoute, createRoute, createRouter, RouterProvider} from "@tanstack/react-router";

import Game from "./pages/Game";
import NotFound from "./pages/NotFound";
import NewGame from "./pages/NewGame";
import {AppProvider} from "./context/AppContext";

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Game,
});

const newGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/new-game",
  component: NewGame,
});

rootRoute.addChildren([indexRoute, newGameRoute]);

const router = createRouter({
  routeTree: rootRoute,
});

const App = () => {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
};

export default App;
