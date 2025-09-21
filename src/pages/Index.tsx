import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Target, TrendingUp } from "lucide-react";
import heroImage from "@/assets/habitz-hero.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Objetivos Claros",
      description: "Defina metas pessoais e acompanhe seu progresso"
    },
    {
      icon: Sparkles,
      title: "Interface Aesthetic",
      description: "Design minimalista e cores relaxantes"
    },
    {
      icon: TrendingUp,
      title: "Progresso Visual",
      description: "Veja sua evolução com gráficos e streaks"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <span className="text-lg">🌟</span>
          </div>
          <span className="text-xl font-medium text-white">Habitz</span>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => navigate("/dashboard")}
          className="bg-white/20 text-white border-white/30 hover:bg-white/30 rounded-xl backdrop-blur-sm"
        >
          Entrar
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-light text-white mb-6 animate-fade-in">
            Desenvolva seus
            <br />
            <span className="font-medium bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              melhores hábitos
            </span>
          </h1>
          
          <p className="text-xl text-white/80 font-light mb-8 max-w-2xl mx-auto animate-slide-up">
            Uma jornada de desenvolvimento pessoal feita especialmente para jovens. 
            Simple, bonito e motivacional.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <Button 
              size="lg"
              onClick={() => navigate("/onboarding")}
              className="px-8 py-4 text-lg font-medium rounded-2xl bg-white text-primary hover:bg-white/90 shadow-strong"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 text-lg font-light rounded-2xl border-2 border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            >
              Ver Demo
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-4xl mx-auto animate-scale-in" style={{ animationDelay: "500ms" }}>
            <img 
              src={heroImage}
              alt="Habitz - Desenvolvimento de hábitos para jovens"
              className="w-full rounded-3xl shadow-strong"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-3xl" />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.title}
                className="glass-card p-8 text-center animate-slide-up"
                style={{ animationDelay: `${700 + index * 200}ms` }}
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-medium text-white mb-4">{feature.title}</h3>
                <p className="text-white/80 font-light">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            Pronto para transformar sua rotina?
          </h2>
          <p className="text-xl text-white/80 font-light mb-8">
            Junte-se a milhares de jovens que já estão criando hábitos incríveis
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/onboarding")}
            className="px-12 py-4 text-lg font-medium rounded-2xl bg-white text-primary hover:bg-white/90 shadow-strong hover:scale-105 transition-all duration-300"
          >
            Começar Gratuitamente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
