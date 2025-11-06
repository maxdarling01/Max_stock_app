import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Play, Image, Zap, Users, TrendingUp, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">The Creator's Asset Library</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Professional Assets,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400"> Instantly Yours</span>
              </h1>

              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Access thousands of premium 4K videos and HD photos. Perfect for editors, marketers, and content creators who refuse to compromise on quality.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                {user ? (
                  <Link
                    to="/"
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    Browse Assets <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2"
                    >
                      Get Started Free <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/signin"
                      className="px-8 py-3 border border-slate-400 hover:border-white text-white font-semibold rounded-lg transition duration-200"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">Unlimited downloads with premium membership</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">All assets are royalty-free licensed</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">Update your library every week</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full h-96">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-3xl opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-white fill-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Creators Choose Maximum</h2>
            <p className="text-xl text-slate-600">Everything you need to create professional content</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl hover:shadow-lg transition duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Premium 4K Videos</h3>
              <p className="text-slate-600">Crystal-clear 4K video footage. Motion graphics, transitions, and effects ready to use. New content every week.</p>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl hover:shadow-lg transition duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Image className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">High-Quality Photos</h3>
              <p className="text-slate-600">Stunning stock photos in multiple formats. Perfect for backgrounds, thumbnails, and social media. Royalty-free.</p>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl hover:shadow-lg transition duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
              <p className="text-slate-600">Search filters find exactly what you need in seconds. Download instantly to your preferred format and resolution.</p>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl hover:shadow-lg transition duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Trusted by Creators</h3>
              <p className="text-slate-600">Used by thousands of professional editors, YouTubers, and marketing teams worldwide. Join our community today.</p>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl hover:shadow-lg transition duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Grow Your Content</h3>
              <p className="text-slate-600">Professional assets help you create higher quality content faster. Stand out and attract more viewers and followers.</p>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl hover:shadow-lg transition duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">100% Royalty-Free</h3>
              <p className="text-slate-600">Use assets for any commercial project. No attribution required. License once, use forever with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <p className="text-blue-100">Premium Assets</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25K+</div>
              <p className="text-blue-100">Active Creators</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <p className="text-blue-100">Downloads Monthly</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <p className="text-blue-100">Creator Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Start Creating Better Content Today</h2>
          <p className="text-xl text-slate-300 mb-8">Join the community of professional creators who trust Maximum for their asset needs.</p>

          {user ? (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 text-lg"
            >
              Explore Assets Now <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 text-lg"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
