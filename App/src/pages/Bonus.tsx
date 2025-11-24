import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Conteúdo Bônus</h1>
          <p className="text-muted-foreground mt-2">
            Materiais complementares para sua jornada. Acesse sempre que quiser.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {bonusSections
            .filter((item) => bonusFlags[item.id as keyof typeof bonusFlags] !== false)
            .map((item) => (
              <Card key={item.id} className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium">{item.title}</h2>
                  <Badge variant="outline">{item.badge}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <Button onClick={() => navigate(item.path)} variant="secondary">
                  Acessar
                </Button>
              </Card>
            ))}
        </div>

        <div className="mt-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Voltar para Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Bonus;
