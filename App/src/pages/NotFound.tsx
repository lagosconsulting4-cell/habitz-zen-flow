import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "motion/react";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <AlertCircle className="w-16 h-16 text-primary" />
          </div>
        </div>
        <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Página não encontrada</p>
        <p className="mb-8 text-sm text-muted-foreground max-w-md">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Voltar para Home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
