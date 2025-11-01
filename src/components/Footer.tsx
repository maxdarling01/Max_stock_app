import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Camera className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-white">StockAI</span>
            </div>
            <p className="text-sm text-gray-400">
              AI-powered stock video and photo platform for content creators.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-blue-400 transition-colors">
                  Browse Assets
                </Link>
              </li>
              <li>
                <Link to="/license" className="text-sm hover:text-blue-400 transition-colors">
                  License Information
                </Link>
              </li>
              <li>
                <a href="#about" className="text-sm hover:text-blue-400 transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm">support@stockai.com</li>
              <li className="text-sm">Terms of Service</li>
              <li className="text-sm">Privacy Policy</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2025 StockAI. All rights reserved. All assets are royalty-free.
          </p>
        </div>
      </div>
    </footer>
  );
}
