import { Home, Plus, Calendar, TrendingUp, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const NavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Início", path: "/dashboard" },
    { icon: Calendar, label: "Calendário", path: "/calendar" },
    { icon: Plus, label: "Criar", path: "/create", isSpecial: true },
    { icon: TrendingUp, label: "Progresso", path: "/progress" },
    { icon: User, label: "Perfil", path: "/profile" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, path, isSpecial }) => {
          const isActive = location.pathname === path;
          
          if (isSpecial) {
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center p-3 bg-gradient-primary rounded-2xl shadow-medium hover:shadow-strong transition-all duration-300 animate-float"
              >
                <Icon className="w-6 h-6 text-white" />
              </button>
            );
          }
          
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "animate-scale-in" : ""}`} />
              <span className="text-xs font-light mt-1">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationBar;