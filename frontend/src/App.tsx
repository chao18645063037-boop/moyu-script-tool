import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import CharacterStudio from './pages/CharacterStudio';
import ConflictLab from './pages/ConflictLab';
import Analytics from './pages/Analytics';
import Community from './pages/Community';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
import { setToken } from './store/authSlice';
import type { RootState } from './store';
import { useAppDispatch } from './hooks/useAppDispatch';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(setToken(token));
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-midnight">
      <AnimatePresence>
        {isAuthenticated && <Sidebar />}
      </AnimatePresence>

      <main className={`min-h-screen transition-all duration-300 ${isAuthenticated ? 'ml-64' : ''}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <Login />
                  </motion.div>
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <Register />
                  </motion.div>
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <Dashboard />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/:id?"
              element={
                <ProtectedRoute>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <Editor />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/characters/:id?"
              element={
                <ProtectedRoute>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <CharacterStudio />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/conflict/:id?"
              element={
                <ProtectedRoute>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <ConflictLab />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/:id?"
              element={
                <ProtectedRoute>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <Analytics />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <Community />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <Achievements />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <Settings />
                  </motion.div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
