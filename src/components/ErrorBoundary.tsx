import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-8 font-sans">
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-10 shadow-xl text-center">
            {/* Ícono de peligro */}
            <div className="h-16 w-16 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
              Algo salió mal en la interfaz
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
              Un error inesperado interrumpió el renderizado del sistema. Puedes recargar la aplicación para intentar resolverlo.
            </p>

            {/* Botón Wave (Uiverse bitter-parrot-97 replica en Tailwind 100% autocontenido) */}
            <div className="flex justify-center mb-6">
              <button
                type="button"
                onClick={this.handleReload}
                className="group relative inline-flex items-center justify-center h-14 px-9 rounded-full font-bold text-sm tracking-tight text-white cursor-pointer overflow-hidden transition-transform duration-200 active:scale-95 bg-[#2563eb] border border-[#2563eb] shadow-md hover:shadow-lg z-10"
              >
                {/* Capas del fondo de la ola */}
                <span className="absolute inset-0 block rounded-full overflow-hidden pointer-events-none -z-10">
                  <span className="absolute left-1/2 -top-[60%] -translate-x-1/2 aspect-square w-[220%] block">
                    {/* Capa 1: Púrpura */}
                    <span className="absolute inset-0 rounded-full bg-[rgb(163,116,255)] scale-0 group-hover:scale-100 transition-transform duration-700 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)]"></span>
                    {/* Capa 2: Turquesa */}
                    <span className="absolute inset-0 rounded-full bg-[rgb(23,241,209)] scale-0 group-hover:scale-100 transition-transform duration-700 delay-[80ms] [transition-timing-function:cubic-bezier(0.19,1,0.22,1)]"></span>
                    {/* Capa 3: Azul */}
                    <span className="absolute inset-0 rounded-full bg-[#2563eb] scale-0 group-hover:scale-100 transition-transform duration-700 delay-[160ms] [transition-timing-function:cubic-bezier(0.19,1,0.22,1)]"></span>
                  </span>
                </span>
                
                {/* Texto del botón */}
                <span className="relative block h-5 w-40 overflow-hidden pointer-events-none">
                  <span className="block transition-all duration-700 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-[120%] group-hover:opacity-0">
                    Recargar Aplicación
                  </span>
                  <span className="absolute inset-x-0 top-0 block transition-all duration-700 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] translate-y-[120%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 text-center">
                    Click para Recargar
                  </span>
                </span>
              </button>
            </div>

            {/* Detalles técnicos opcionales */}
            {this.state.error && (
              <div className="pt-4 border-t border-slate-100 text-left">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                >
                  <span>{this.state.showDetails ? "Ocultar diagnóstico" : "Ver diagnóstico técnico"}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 transition-transform ${this.state.showDetails ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {this.state.showDetails && (
                  <pre className="mt-4 p-4 bg-slate-50 border border-slate-150 rounded-2xl text-[11px] font-mono text-slate-600 overflow-x-auto max-h-40 leading-relaxed whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
