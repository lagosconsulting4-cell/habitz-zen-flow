import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in duration-700">
        <div className="space-y-6">
          <div className="inline-block bg-accent/10 px-6 py-2 rounded-full mb-4">
            <span className="text-accent font-semibold">App BORA</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Pare de prometer.
            <span className="block text-accent mt-2">Comece a fazer.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Descubra em 2 minutos por que você não consegue manter uma rotina — e como mudar isso de verdade.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate("/quiz")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-7 text-xl rounded-xl border-4 border-accent shadow-lg hover:shadow-xl transition-smooth w-full sm:w-auto"
          >
            <span className="mr-2">Descobrir agora</span>
            <span className="text-accent">→</span>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Mais de 5.000 pessoas já viraram o jogo com o BORA
        </p>
      </div>
    </div>
  );
};

export default Index;
