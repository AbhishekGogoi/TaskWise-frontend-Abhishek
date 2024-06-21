import React, { useState, lazy, Suspense } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import Loading from "./components/Loading";
import { SidebarProvider } from "./context/SidebarContext";
import ErrorPage from "./pages/ErrorPage/ErrorPage";

// Lazy load the pages
const ProjectPage = lazy(() => import("./pages/Project/ProjectPage"));
const LandingPage = lazy(() => import("./pages/landingPage/LandingPage"));
const WorkspacesPage = lazy(() => import("./pages/Workspace/WorkspacePage"));
const MyTaskPage = lazy(() => import("./pages/MyTaskPage/MyTaskPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage/CalendarPage"));
const WorkspaceDetails = lazy(() =>
  import("./pages/Workspace/WorkspaceDetails")
);
const NewTaskPage = lazy(() => import("./pages/Board/NewTaskPage"));
const TaskDetailsPage = lazy(() => import("./pages/Board/TaskDetailsPage"));
const Board = lazy(() => import("./pages/Board/Board"));
const LoginPage = lazy(() => import("./pages/LoginPage/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage/SignupPage"));
const ForgotPasswordPage = lazy(() =>
  import("./pages/ForgotPassword/ForgotPasswordPage")
);
const VerificationPage = lazy(() =>
  import("./pages/ForgotPassword/VerificationPage")
);
const ResetPasswordPage = lazy(() =>
  import("./pages/ForgotPassword/ResetPasswordPage")
);
const ConfirmationPage = lazy(() =>
  import("./pages/ForgotPassword/ConfirmationPage")
);
const ProfileSettingsPage = lazy(() =>
  import("./pages/ProfilePage/ProfilePage")
);
const AIInputPage = lazy(() => import("./pages/AI/AIInputPage"));
const TaskList = lazy(() => import("./pages/AI/TaskCarousel/TaskList"));

const theme = createTheme({
  typography: {
    fontFamily: "Manrope, sans-serif",
  },
});

function AppLayout() {
  const location = useLocation();
  const isLandingPage = [
    "/",
    "/login",
    "/signup",
    "/forgotpassword",
    "/verification",
    "/resetpassword",
    "/confirmation",
    "*",
  ].includes(location.pathname);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const isLoggedIn = sessionStorage.getItem("token");

  return (
    <>
      {!isLandingPage && (
        <Header isSmallScreen={isSmallScreen} toggleDrawer={toggleDrawer} />
      )}
      <div style={isLandingPage ? {} : { display: "flex" }}>
        {!isLandingPage && (
          <>
            {isSmallScreen ? (
              <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer}
                PaperProps={{
                  sx: { overflow: "hidden" },
                }}
              >
                <Sidebar />
              </Drawer>
            ) : (
              <Sidebar />
            )}
          </>
        )}
        <main
          style={
            isLandingPage
              ? {}
              : { backgroundColor: "#f0f0f0", padding: "20px", flexGrow: 1 }
          }
        >
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/resetpassword" element={<ResetPasswordPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              {isLoggedIn ? (
                <>
                  <Route path="/projects" element={<ProjectPage />} />
                  <Route path="/projects/:id" element={<Board />} />
                  <Route
                    path="/projects/:id/new-task"
                    element={<NewTaskPage />}
                  />
                  <Route path="/tasks/:taskID" element={<TaskDetailsPage />} />
                  <Route path="/workspaces" element={<WorkspacesPage />} />
                  <Route
                    path="/workspaces/:id"
                    element={<WorkspaceDetails />}
                  />
                  <Route path="/my-tasks" element={<MyTaskPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/settings" element={<ProfileSettingsPage />} />
                  <Route path="/createai" element={<AIInputPage />} />
                  <Route path="/task-carousel" element={<TaskList />} />
                </>
              ) : null}
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SidebarProvider>
        <Router>
          <AppLayout />
        </Router>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
