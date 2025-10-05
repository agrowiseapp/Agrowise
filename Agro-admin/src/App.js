import { CssBaseline, StyledEngineProvider } from "@mui/material";
import Dashboard from "./pages/Main/Dashboard";
import News from "./pages/Main/News";
import Messages from "./pages/Main/Messages";
import GroupChat from "./pages/Main/GroupChat";
import Login from "./pages/Auth/Login";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme/theme";

import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  useRouteError,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/Store/store";
import Settings from "./pages/Main/Settings";
import Register from "./pages/Auth/Register";
import PrivacyPolicy from "./pages/Auth/PrivacyPolicy";
import Reports from "./pages/Main/Reports";
import ResetPassword from "./pages/Auth/ResetPassword";
import CancelSubscription from "./pages/Auth/CancelSubscription";

function App() {
  const routes = createRoutesFromElements(
    <>
      <Route path="/" element={<Login />} errorElement={<ErrorBoundary />} />{" "}
      <Route
        path="/Register"
        element={<Register />}
        errorElement={<ErrorBoundary />}
      />{" "}
      <Route
        path="/Dashboard"
        element={<Dashboard />}
        errorElement={<ErrorBoundary />}
      />
      <Route path="/News" element={<News />} errorElement={<ErrorBoundary />} />
      <Route
        path="/Messages"
        element={<Messages />}
        errorElement={<ErrorBoundary />}
      />
      <Route
        path="/GroupChat"
        element={<GroupChat />}
        errorElement={<ErrorBoundary />}
      />
      <Route
        path="/Settings"
        element={<Settings />}
        errorElement={<ErrorBoundary />}
      />
      <Route
        path="/Policy"
        element={<PrivacyPolicy />}
        errorElement={<ErrorBoundary />}
      />
      <Route
        path="/Reports"
        element={<Reports />}
        errorElement={<ErrorBoundary />}
      />
      <Route
        path="/ResetPassword"
        element={<ResetPassword />}
        errorElement={<ErrorBoundary />}
      />
      <Route
        path="/CancelSubscription"
        element={<CancelSubscription />}
        errorElement={<ErrorBoundary />}
      />
    </>
  );
  const router = createHashRouter(routes, { basename: "/" });

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <CssBaseline />
          <div className="App">
            <RouterProvider router={router} />
          </div>
        </Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

function ErrorBoundary() {
  let error = useRouteError();
  console.error(error);
  // Uncaught ReferenceError: path is not defined
  return (
    <div>
      <h1>Error</h1>
    </div>
  );
}

export default App;
