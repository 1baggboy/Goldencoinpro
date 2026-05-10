import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            isFirestoreError = true;
            errorMessage = `Firestore ${parsed.operationType} error: ${parsed.error}`;
            if (parsed.path) {
              errorMessage += ` at ${parsed.path}`;
            }
          }
        }
      } catch (e) {
        // Not a JSON error message, use the raw message
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121212] border border-[#C9A96E]/20 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto text-[#C9A96E]">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                {isFirestoreError 
                  ? "We encountered a database permission issue. Our team has been notified."
                  : "An unexpected error occurred while processing your request."}
              </p>
            </div>

            <div className="p-4 bg-[#0B0B0B] rounded-2xl border border-[#C9A96E]/10">
              <p className="text-xs font-mono text-[#C9A96E] break-all">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-[#C9A96E] text-[#0B0B0B] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#D4B985] transition-all"
            >
              <RefreshCw size={20} />
              Try Again
            </button>
            
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
              Error ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
