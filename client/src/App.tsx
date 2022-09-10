import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import PageNotFound from './pages/404';
import { ThemeProvider } from '@mui/material';
import { mainTheme } from './utils/theme';
import { AuthProvider, useAuthState } from './contexts/auth';
import CoursePage from './pages/Course';

function RequireAuth() {
  let auth = useAuthState();
  let location = useLocation();

  if (!auth.user && !auth.loading) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return <Outlet />;
}


export function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={mainTheme}>
        <Routes>
          <Route index element={<Home />}></Route>
          <Route path="login" element={<Login />}></Route>
          <Route path="*" element={<PageNotFound />}></Route>
          <Route element={<RequireAuth />}>
            <Route path="courses/:id" element={<CoursePage />}></Route>
          </Route>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
