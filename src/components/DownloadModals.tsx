import { X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full p-6 bg-gray-900 rounded-lg border-2" style={{ borderColor: '#d4af37' }}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold" style={{ color: '#d4af37' }}>
            Subscribe to Download
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-300 mb-6">
          Sign in or choose a plan to start downloading premium stock content.
        </p>

        <div className="space-y-3">
          <Link
            to="/pricing"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-lg font-semibold text-center transition-all hover:shadow-lg"
            style={{ backgroundColor: '#d4af37', color: '#000' }}
          >
            Browse Plans
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-lg font-semibold border-2 text-white hover:bg-white hover:text-black transition-all"
            style={{ borderColor: '#d4af37' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface OutOfDownloadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: string;
  renewalDate: string;
}

export function OutOfDownloadsModal({
  isOpen,
  onClose,
  planType,
  renewalDate,
}: OutOfDownloadsModalProps) {
  if (!isOpen) return null;

  const getRenewalMessage = () => {
    if (planType === 'basic') {
      return `Your downloads will reset on ${new Date(renewalDate).toLocaleDateString()}.`;
    }
    if (planType === 'pro' || planType === 'elite') {
      return `Unused downloads roll over to next month. Next renewal: ${new Date(renewalDate).toLocaleDateString()}`;
    }
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full p-6 bg-gray-900 rounded-lg border-2" style={{ borderColor: '#d4af37' }}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6" style={{ color: '#d4af37' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#d4af37' }}>
              No Downloads Remaining
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-300 mb-4">
          You've used all your downloads for this month.
        </p>

        <p className="text-gray-400 text-sm mb-6">
          {getRenewalMessage()}
        </p>

        <div className="space-y-3">
          <Link
            to="/pricing"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-lg font-semibold text-center transition-all hover:shadow-lg"
            style={{ backgroundColor: '#d4af37', color: '#000' }}
          >
            Upgrade Plan
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-lg font-semibold border-2 text-white hover:bg-white hover:text-black transition-all"
            style={{ borderColor: '#d4af37' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full p-6 bg-gray-900 rounded-lg border-2" style={{ borderColor: '#d4af37' }}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-300 mb-6">
          Please sign in to your account to download assets.
        </p>

        <div className="space-y-3">
          <Link
            to="/signin"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-lg font-semibold text-center transition-all hover:shadow-lg"
            style={{ backgroundColor: '#d4af37', color: '#000' }}
          >
            Sign In
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-lg font-semibold border-2 text-white hover:bg-white hover:text-black transition-all"
            style={{ borderColor: '#d4af37' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
