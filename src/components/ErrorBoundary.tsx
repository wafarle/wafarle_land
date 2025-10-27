'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Here you can log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>

              {/* Error Message */}
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                عذراً، حدث خطأ!
              </h1>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                واجه هذا المكون مشكلة غير متوقعة.
                يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
              </p>

              {/* Error Details (development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-left">
                  <p className="text-red-400 font-semibold text-sm mb-2">تفاصيل الخطأ:</p>
                  <pre className="text-red-300 text-xs font-mono overflow-x-auto">
                    {this.state.error.message}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-4 h-4" />
                  حاول مرة أخرى
                </button>
                
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  <Home className="w-4 h-4" />
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
