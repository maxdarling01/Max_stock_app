import { Camera, Menu, X, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionBadge from './SubscriptionBadge';

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
    <header className="bg-black shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? "/home" : "/"} className="flex items-center space-x-2 group">
            <Camera className="w-8 h-8 transition-colors" style={{ color: '#d4af37' }} />
            <span className="text-xl font-bold text-white">Maximum Stock</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {user && (
              <>
                <Link
                  to="/home"
                  className={`${
                    isActive('/home') || isActive('/search')
                      ? 'font-semibold underline'
                      : 'text-white hover:text-opacity-80'
                  } transition-colors`}
                  style={{
                    color: isActive('/home') || isActive('/search') ? '#d4af37' : 'white'
                  }}
                >
                  Browse
                </Link>
                <Link
                  to="/pricing"
                  className="text-white hover:text-opacity-80 transition-colors"
                  style={{
                    color: isActive('/pricing') ? '#d4af37' : 'white'
                  }}
                >
                  Pricing
                </Link>
                <Link
                  to="/license"
                  className="text-white hover:text-opacity-80 transition-colors"
                  style={{
                    color: isActive('/license') ? '#d4af37' : 'white'
                  }}
                >
                  License
                </Link>
                {user.email === 'maxdarling84@gmail.com' && (
                  <Link
                    to="/admin/upload"
                    className="text-white hover:text-opacity-80 transition-colors"
                    style={{
                      color: isActive('/admin/upload') ? '#d4af37' : 'white'
                    }}
                  >
                    Admin Upload
                  </Link>
                )}
              </>
            )}
            <a
              href="#about"
              className="text-white hover:text-opacity-80 transition-colors"
            >
              About
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <SubscriptionBadge />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-white hover:text-opacity-80 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-white hover:text-opacity-80 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 font-medium rounded-lg transition-colors"
                  style={{ backgroundColor: '#d4af37', color: '#000' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: mobileMenuOpen ? '#d4af37' : 'white' }}
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
        <div className="md:hidden bg-gray-950 border-t border-gray-800">
          <nav className="flex flex-col px-4 py-4 space-y-3">
            {user && (
              <>
                <Link
                  to="/home"
                  className="py-2 text-lg transition-colors"
                  style={{
                    color: isActive('/home') || isActive('/search') ? '#d4af37' : 'white'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse
                </Link>
                <Link
                  to="/pricing"
                  className="py-2 text-lg transition-colors"
                  style={{
                    color: isActive('/pricing') ? '#d4af37' : 'white'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/license"
                  className="py-2 text-lg transition-colors"
                  style={{
                    color: isActive('/license') ? '#d4af37' : 'white'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  License
                </Link>
                {user.email === 'maxdarling84@gmail.com' && (
                  <Link
                    to="/admin/upload"
                    className="py-2 text-lg transition-colors"
                    style={{
                      color: isActive('/admin/upload') ? '#d4af37' : 'white'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Upload
                  </Link>
                )}
              </>
            )}
            <a
              href="#about"
              className="text-white py-2 text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <div className="pt-2 border-t border-gray-800">
              {user ? (
                <>
                  <p className="text-sm text-gray-300 py-2">{user.email}</p>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-2 px-2 py-2 text-white hover:text-opacity-80 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="block text-white hover:text-opacity-80 py-2 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block text-white font-medium rounded-lg px-4 py-2 mt-2 text-center"
                    style={{ backgroundColor: '#d4af37', color: '#000' }}
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
