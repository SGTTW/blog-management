// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { auth } from "./components/firebase";
import AdminLogin from "./components/AdminLogin";
import Dashboard from "./components/Dashboard";
import Blog from "./components/Blogs";
import { Toaster } from "sonner";

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
    <>
      <Toaster position="top-right" richColors />
      <Router>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-lg p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              {/* Logo or Title */}
              <h1 className="text-xl font-bold">Blog System</h1>

              {/* Navigation Links */}
              <div className="flex items-center space-x-4 ml-auto">
                <a
                  href="/"
                  className="text-white px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 hover:text-blue-600"
                >
                  Public Blog
                </a>
                {user ? (
                  <>
                    <a
                      href="/dashboard"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      {window.location.pathname === "/dashboard" ? (
                        <button onClick={handleLogout}>Logout</button>
                      ) : (
                        "Admin Dashboard"
                      )}
                    </a>
                  </>
                ) : (
                  <a
                    href="/login"
                    className="text-gray-700 hover:text-blue-600"
                  >
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
    </>
  );
}

export default App;
