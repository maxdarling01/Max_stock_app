import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function SuccessPage() {
  useEffect(() => {
    const confettiDuration = 3000;
    const animationEnd = Date.now() + confettiDuration;

    const colors = ['#d4af37', '#ffffff', '#000000'];

    function frame() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return;
      }

      requestAnimationFrame(frame);
    }

    frame();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: '#d4af37' }}>
            <CheckCircle className="w-20 h-20 text-black" />
          </div>
          <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full animate-ping opacity-20" style={{ backgroundColor: '#d4af37' }}></div>
        </div>

        <h1 className="text-5xl font-bold mb-6" style={{ color: '#d4af37' }}>
          Payment Successful!
        </h1>

        <p className="text-2xl text-white mb-4">
          Welcome to Maximum Stock
        </p>

        <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
          Your payment has been processed successfully. You now have access to premium stock content. Start downloading amazing videos and photos right away!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/home"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
            style={{ backgroundColor: '#d4af37', color: '#000' }}
          >
            Start Browsing <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/license"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 rounded-lg font-semibold text-white hover:bg-white hover:text-black transition-all"
            style={{ borderColor: '#d4af37' }}
          >
            View License Details
          </Link>
        </div>

        <div className="mt-16 p-6 bg-gray-900 rounded-lg border border-gray-800 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-white mb-3">What's Next?</h3>
          <ul className="text-left text-gray-400 space-y-2">
            <li className="flex items-start gap-3">
              <span style={{ color: '#d4af37' }}>1.</span>
              <span>Browse our extensive library of premium stock content</span>
            </li>
            <li className="flex items-start gap-3">
              <span style={{ color: '#d4af37' }}>2.</span>
              <span>Use AI search to find exactly what you need</span>
            </li>
            <li className="flex items-start gap-3">
              <span style={{ color: '#d4af37' }}>3.</span>
              <span>Download in your preferred format and resolution</span>
            </li>
            <li className="flex items-start gap-3">
              <span style={{ color: '#d4af37' }}>4.</span>
              <span>Start creating amazing content</span>
            </li>
          </ul>
        </div>

        <p className="mt-12 text-sm text-gray-500">
          A confirmation email has been sent to your inbox
        </p>
      </div>
    </div>
  );
}
