import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function Welcome() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processando seu pagamento...");

  useEffect(() => {
    const handleStripeRedirect = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setStatus("error");
        setMessage("Sessão não encontrada. Redirecionando...");
        setTimeout(() => navigate("/auth"), 2000);
        return;
      }

      try {
        setMessage("Buscando informações do pagamento...");

        // Chamar edge function para buscar dados da sessão
        const { data, error } = await supabase.functions.invoke("stripe-session-info", {
          body: { sessionId },
        });

        if (error) throw error;

        if (!data || !data.email) {
          throw new Error("Dados da sessão inválidos");
        }

        setMessage(`Bem-vindo, ${data.email}! Fazendo login...`);

        // Fazer login com OTP (magic link instantâneo)
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            shouldCreateUser: false, // Usuário já existe
          },
        });

        if (signInError) {
          // Se OTP falhar, tentar com senha temporária
          console.warn("OTP failed, trying alternative method");

          // Redirecionar para página de definir senha
          setMessage("Por favor, defina sua senha para continuar.");
          setTimeout(() => {
            navigate(`/definir-senha?email=${encodeURIComponent(data.email)}`);
          }, 2000);
          return;
        }

        setStatus("success");
        setMessage("Login realizado com sucesso! Redirecionando...");

        // Redirecionar para onboarding após 2 segundos
        setTimeout(() => {
          navigate("/onboarding");
        }, 2000);

      } catch (error) {
        console.error("Error processing Stripe redirect:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? `Erro: ${error.message}`
            : "Erro ao processar pagamento. Redirecionando para login..."
        );

        // Redirecionar para auth após 3 segundos
        setTimeout(() => navigate("/auth"), 3000);
      }
    };

    handleStripeRedirect();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="relative">
            {status === "loading" && (
              <Loader2 className="w-16 h-16 text-lime-500 animate-spin" />
            )}
            {status === "success" && (
              <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-lime-600" />
              </div>
            )}
            {status === "error" && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {status === "loading" && "Processando..."}
              {status === "success" && "Sucesso!"}
              {status === "error" && "Ops!"}
            </h1>
            <p className="text-slate-600">{message}</p>
          </div>

          {/* Additional info for success */}
          {status === "success" && (
            <div className="w-full bg-lime-50 rounded-lg p-4 border border-lime-200">
              <p className="text-sm text-lime-800">
                🎉 Seu acesso premium foi ativado com sucesso!
              </p>
            </div>
          )}

          {/* Loading progress */}
          {status === "loading" && (
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-lime-500 rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
