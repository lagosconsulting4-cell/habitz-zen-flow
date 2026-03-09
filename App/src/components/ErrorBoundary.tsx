import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Algo deu errado
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Ocorreu um erro inesperado. Tente recarregar a pagina.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar pagina
            </Button>
            <a
              href="/app/dashboard"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Voltar ao inicio
            </a>
          </div>
        </div>
      </div>
    );
  }
}
