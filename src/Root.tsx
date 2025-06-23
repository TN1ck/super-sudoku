import * as React from "react";

import {Outlet, ReactLocation, Router} from "@tanstack/react-location";

import Game from "./pages/Game";
import NotFound from "./pages/NotFound";
import NewGame from "./pages/NewGame";
import {AppProvider} from "./context/AppContext";

const routes = [
  {
    path: "/new-game",
    element: <NewGame />,
  },
  {
    path: "/",
    element: <Game />,
  },
  {
    path: "404",
    template: <NotFound />,
  },
];

const location = new ReactLocation();

const App = () => {
  return (
    <AppProvider>
      <Router location={location} routes={routes}>
        <React.Suspense fallback={<em>Loading...</em>}>
          <div>
            <Outlet />
          </div>
        </React.Suspense>
      </Router>
    </AppProvider>
  );
};

export default App;
