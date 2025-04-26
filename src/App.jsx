import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import LoginForm from './pages/LoginForm';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Import from './pages/Import';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      setUser(null);
    }).catch((error) => {
      console.error('Sign out error:', error);
    });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginForm />} />

        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/reports" element={user ? <Reports /> : <Navigate to="/" />} />
        <Route path="/import" element={user ? <Import /> : <Navigate to="/" />} />
      </Routes>

      {user && (
        <button onClick={handleSignOut}>Sign Out</button>
      )}
    </Router>
  );
}

export default App;
