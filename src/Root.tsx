import * as React from "react";

import {Outlet, ReactLocation, Router} from "@tanstack/react-location";

import {Provider} from "react-redux";

import Header from "./components/modules/Header";
import store from "./state/store";
import Game from "./components/pages/Game";
import NotFound from "./components/pages/NotFound";
import NewGame from "./components/pages/NewGame";

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
    <Provider store={store}>
      <Router location={location} routes={routes}>
        <Header />
        <React.Suspense fallback={<em>Loading...</em>}>
          <div>
            <Outlet />
          </div>
        </React.Suspense>
      </Router>
    </Provider>
  );
};

export default App;
