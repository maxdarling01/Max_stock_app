import { Camera, Menu, X, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? "/home" : "/"} className="flex items-center space-x-2 group">
            <Camera className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
            <span className="text-xl font-bold text-gray-900">Maximum Stock</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {user && (
              <>
                <Link
                  to="/home"
                  className={`${
                    isActive('/home') || isActive('/search')
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-blue-600'
                  } transition-colors`}
                >
                  Browse
                </Link>
                <Link
                  to="/license"
                  className={`${
                    isActive('/license')
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-blue-600'
                  } transition-colors`}
                >
                  License
                </Link>
                {user.email === 'maxdarling84@gmail.com' && (
                  <Link
                    to="/admin/upload"
                    className={`${
                      isActive('/admin/upload')
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-600 hover:text-blue-600'
                    } transition-colors`}
                  >
                    Admin Upload
                  </Link>
                )}
              </>
            )}
            <a
              href="#about"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="flex flex-col px-4 py-4 space-y-3">
            {user && (
              <>
                <Link
                  to="/home"
                  className={`${
                    isActive('/home') || isActive('/search')
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-600'
                  } py-2 text-lg`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse
                </Link>
                <Link
                  to="/license"
                  className={`${
                    isActive('/license')
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-600'
                  } py-2 text-lg`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  License
                </Link>
                {user.email === 'maxdarling84@gmail.com' && (
                  <Link
                    to="/admin/upload"
                    className={`${
                      isActive('/admin/upload')
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-600'
                    } py-2 text-lg`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Upload
                  </Link>
                )}
              </>
            )}
            <a
              href="#about"
              className="text-gray-600 py-2 text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <div className="pt-2 border-t">
              {user ? (
                <>
                  <p className="text-sm text-gray-600 py-2">{user.email}</p>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-2 px-2 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="block text-gray-600 hover:text-gray-900 py-2 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 mt-2 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
