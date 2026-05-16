import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="bg-dark-panel border border-rose-500/20 p-12 rounded-[3.5rem] max-w-xl w-full text-center space-y-8 shadow-2xl">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
               <AlertCircle size={40} />
            </div>
            <div className="space-y-3">
               <h2 className="text-3xl font-black text-white font-display italic uppercase tracking-wider">System Logic Error</h2>
               <p className="text-slate-400 font-medium leading-relaxed">
                 The tactical unit experienced an unhandled exception. This usually indicates a synchronization collision or data corruption.
               </p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] text-rose-400 font-mono break-all text-left overflow-auto max-h-32">
               {this.state.error?.message}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white w-full py-5 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
            >
               <RefreshCcw size={16} /> Re-Initialize Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
