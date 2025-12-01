import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Gift, ArrowLeft } from "lucide-react";
import { bonusFlags } from "@/config/bonusFlags";

const bonusSections = [
  {
    id: "plano",
    title: "Programa 30 dias",
    description: "Conteúdo estruturado com módulos, aulas e recursos.",
    path: "/plano",
    badge: "Bônus",
  },
  {
    id: "guided",
    title: "Jornada Guiada",
    description: "Trilha diária com ações/reflexões.",
    path: "/guided",
    badge: "Bônus",
  },
  {
    id: "meditation",
    title: "Meditações",
    description: "Sessões de áudio para foco e calma.",
    path: "/meditation",
    badge: "Bônus",
  },
  {
    id: "books",
    title: "Biblioteca",
    description: "Livros recomendados para desenvolvimento.",
    path: "/books",
    badge: "Bônus",
  },
  {
    id: "tips",
    title: "Insights & Dicas",
    description: "Sugestões práticas de rotina e nutrição.",
    path: "/tips",
    badge: "Bônus",
  },
];

const Bonus = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground hover:bg-muted mb-6 flex items-center gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Home
        </Button>

        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Gift className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground">Conteúdo Bônus</h1>
          <p className="text-muted-foreground mt-2">
            Materiais complementares para sua jornada. Acesse sempre que quiser.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {bonusSections
            .filter((item) => bonusFlags[item.id as keyof typeof bonusFlags] !== false)
            .map((item) => (
              <Card key={item.id} className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-foreground">{item.title}</h2>
                  <Badge variant="outline" className="border-primary/50 text-primary">{item.badge}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <Button
                  onClick={() => navigate(item.path)}
                  className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Acessar
                </Button>
              </Card>
            ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Bonus;
