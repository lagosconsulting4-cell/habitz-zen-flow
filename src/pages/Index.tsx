import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Target, Users, TrendingUp, Crown, BadgeCheck, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Plano unico",
      description: "Apenas R$ 47,90 para acesso vitalicio a todo o Habitz"
    },
    {
      icon: TrendingUp,
      title: "Resultados reais",
      description: "Rotinas guiadas, trilhas e recursos premium sem bloqueios"
    },
    {
      icon: Users,
      title: "Comunidade focada",
      description: "Jovens comprometidos com disciplina, produtividade e crescimento"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-primary">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <span className="text-xl font-semibold text-white">H</span>
          </div>
          <span className="text-2xl font-semibold text-white">Habitz</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/auth")}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            Entrar
          </Button>
          <Crown className="w-5 h-5 text-white/60" />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm mb-8">
              <BadgeCheck className="w-4 h-4" />
              Pagamento unico, acesso imediato, garantia de 7 dias
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 animate-fade-in leading-tight">
            A plataforma definitiva
            <br />
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              para construir habitos
            </span>
          </h1>

          <p className="text-xl text-white/85 mb-12 max-w-2xl mx-auto animate-slide-up leading-relaxed">
            Tenha todas as ferramentas premium do Habitz por apenas R$ 47,90. Sem assinatura mensal, sem pegadinhas. Compre uma vez e evolua para sempre.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <Button
              size="lg"
              onClick={() => navigate("/pricing")}
              className="px-8 py-4 text-lg font-semibold rounded-xl bg-white text-primary hover:bg-white/90 shadow-strong transform hover:scale-105 transition-all duration-200"
            >
              Garantir acesso vitalicio
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="px-8 py-4 text-lg font-medium rounded-xl border-2 border-white/20 text-white bg-white/5 hover:bg-white/15 backdrop-blur-sm"
            >
              Ja sou cliente
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto animate-scale-in" style={{ animationDelay: "600ms" }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">50k+</div>
              <div className="text-white/70 text-sm">Pessoas organizando a rotina</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">1M+</div>
              <div className="text-white/70 text-sm">Habitos registrados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">94%</div>
              <div className="text-white/70 text-sm">Relatam ganhos de disciplina</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Tudo incluso no valor unico
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Dashboard completo, trilha guiada, meditacoes, biblioteca de estudos, insights e suporte continuo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card p-8 text-center animate-slide-up hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${800 + index * 200}ms` }}
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-white/75 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 max-w-4xl mx-auto animate-fade-in">
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-6 text-yellow-400">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="w-6 h-6" />
              ))}
            </div>
            <blockquote className="text-2xl font-medium text-white mb-6 italic">
              "Paguei uma vez e encontrei o sistema ideal para manter disciplina. Tudo em um lugar, sem mensalidades." 
            </blockquote>
            <cite className="text-white/70">
              - Lucas, 22 anos, estudante de engenharia
            </cite>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Pare de adiar. Invista em voce agora.
          </h2>
          <p className="text-xl text-white/80 leading-relaxed">
            Uma unica decisao libera todo o conteudo premium do Habitz. Atualizacoes futuras, suporte e novas ferramentas ja incluidos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/pricing")}
              className="px-12 py-5 text-xl font-semibold rounded-2xl bg-white text-primary hover:bg-white/90 shadow-strong hover:scale-105 transition-all duration-300"
            >
              Comprar acesso vitalicio
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="px-12 py-5 text-xl font-semibold rounded-2xl border-2 border-white/30 text-white hover:bg-white/10"
            >
              Entrar na minha conta
            </Button>
          </div>
          <p className="text-white/60 text-sm">
            Pagamento unico de R$ 47,90 com garantia de 7 dias.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

