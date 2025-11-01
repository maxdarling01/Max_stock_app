import { Camera, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Camera className="w-8 h-8 text-blue-800 group-hover:text-blue-600 transition-colors" />
            <span className="text-xl font-bold text-gray-900">StockAI</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`${
                isActive('/') || isActive('/search')
                  ? 'text-blue-800 font-semibold'
                  : 'text-gray-600 hover:text-blue-800'
              } transition-colors`}
            >
              Browse
            </Link>
            <Link
              to="/license"
              className={`${
                isActive('/license')
                  ? 'text-blue-800 font-semibold'
                  : 'text-gray-600 hover:text-blue-800'
              } transition-colors`}
            >
              License
            </Link>
            <a
              href="#about"
              className="text-gray-600 hover:text-blue-800 transition-colors"
            >
              About
            </a>
          </nav>

          <button
            className="md:hidden p-2 text-gray-600 hover:text-blue-800 transition-colors"
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
        <div className="md:hidden bg-white border-t animate-fadeIn">
          <nav className="flex flex-col px-4 py-4 space-y-3">
            <Link
              to="/"
              className={`${
                isActive('/') || isActive('/search')
                  ? 'text-blue-800 font-semibold'
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
                  ? 'text-blue-800 font-semibold'
                  : 'text-gray-600'
              } py-2 text-lg`}
              onClick={() => setMobileMenuOpen(false)}
            >
              License
            </Link>
            <a
              href="#about"
              className="text-gray-600 py-2 text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
