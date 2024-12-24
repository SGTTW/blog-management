// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { auth } from "./components/firebase";
import AdminLogin from "./components/AdminLogin";
import Dashboard from "./components/Dashboard";
import Blog from "./components/Blogs";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => signOut(auth);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            {/* Logo or Title */}
            <h1 className="text-xl font-bold">Blog System</h1>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4 ml-auto">
              <a href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </a>
              {user ? (
                <>
                  <a
                    href="/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <a href="/login" className="text-gray-700 hover:text-blue-600">
                  Admin Login
                </a>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Blog />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <AdminLogin />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
