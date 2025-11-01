import { X, Download, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Asset } from '../data/mockAssets';

interface DownloadModalProps {
  asset: Asset;
  onClose: () => void;
}

export default function DownloadModal({ asset, onClose }: DownloadModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const videoFormats = [
    { value: 'mp4-1080p', label: 'MP4 (1080p)', size: '~50 MB' },
    { value: 'mp4-4k', label: 'MP4 (4K)', size: '~150 MB' },
    { value: 'mov-1080p', label: 'MOV (1080p)', size: '~80 MB' },
    { value: 'mov-4k', label: 'MOV (4K)', size: '~200 MB' },
  ];

  const photoFormats = [
    { value: 'jpg-high', label: 'JPG (High-res)', size: '~15 MB' },
    { value: 'jpg-medium', label: 'JPG (Medium-res)', size: '~5 MB' },
    { value: 'png-high', label: 'PNG (High-res)', size: '~25 MB' },
    { value: 'png-medium', label: 'PNG (Medium-res)', size: '~8 MB' },
  ];

  const formats = asset.type === 'video' ? videoFormats : photoFormats;

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const canDownload = selectedFormat && agreedToTerms;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Download Asset</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {downloadSuccess ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Downloaded successfully!
              </h3>
              <p className="text-gray-600">Your file is ready to use.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {asset.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {asset.type === 'video' ? 'Video' : 'Photo'} • {asset.resolution} • {asset.file_size}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Format
                </label>
                <div className="space-y-2">
                  {formats.map((format) => (
                    <label
                      key={format.value}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedFormat === format.value
                          ? 'border-blue-800 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="format"
                          value={format.value}
                          checked={selectedFormat === format.value}
                          onChange={(e) => setSelectedFormat(e.target.value)}
                          className="w-4 h-4 text-blue-800 focus:ring-blue-800"
                        />
                        <span className="ml-3 font-medium text-gray-900">
                          {format.label}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{format.size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Royalty-Free Commercial License
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <Check className="w-5 h-5 mr-2" />
                      You CAN
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        Use in commercial projects
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        Modify and edit freely
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        Use in client work
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        Use in unlimited projects
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      You CANNOT
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        Resell or redistribute
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        Claim as your own
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        Use in trademark/logo
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        Sell as stock asset
                      </li>
                    </ul>
                  </div>
                </div>

                <label className="flex items-start mt-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 text-blue-800 rounded focus:ring-blue-800 mt-0.5"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I agree to these license terms and understand the usage rights
                  </span>
                </label>
              </div>

              <button
                onClick={handleDownload}
                disabled={!canDownload}
                className={`w-full py-4 rounded-lg font-semibold text-white flex items-center justify-center space-x-2 transition-all ${
                  canDownload
                    ? 'bg-blue-800 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <Download className="w-5 h-5" />
                <span>Download Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
