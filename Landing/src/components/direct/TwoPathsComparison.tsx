import React from "react";
import { motion } from "motion/react";
import { ArrowRight, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TwoPathsComparisonProps {
  onContinue: () => void;
}

const TwoPathsComparison: React.FC<TwoPathsComparisonProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        className="max-w-3xl w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 border border-purple-500/30"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-sm text-foreground">Comparação Final</span>
          </motion.div>

          <motion.h2
            className="text-2xl md:text-3xl font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Dois Caminhos, Duas Realidades
          </motion.h2>

          <motion.p
            className="text-muted-foreground max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            A mesma pessoa, os mesmos 8 momentos do dia — mas com escolhas completamente diferentes.
          </motion.p>
        </div>

        {/* Comparison Grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* LEFT - DOR Path */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-2 border-red-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-red-400">Caminho da DOR</h3>
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nível de estresse final</span>
                  <span className="text-xl font-bold text-red-400">150%</span>
                </div>

                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="pt-3 space-y-2 border-t border-red-500/20">
                <p className="text-xs text-red-400 font-semibold">Estado mental:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Colapso mental e burnout</li>
                  <li>• Produtividade em queda livre</li>
                  <li>• Relacionamentos deteriorados</li>
                  <li>• Saúde física comprometida</li>
                </ul>
              </div>

              <div className="bg-red-500/10 rounded-xl p-3 text-center">
                <p className="text-xs text-red-400 font-medium">
                  "Eu não aguento mais..."
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT - BORA Path */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-2 border-green-500/30 rounded-2xl p-6 space-y-4 relative overflow-hidden">
              {/* Glow effect */}
              <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <div className="flex items-center justify-between relative z-10">
                <h3 className="text-lg font-bold text-green-400">Caminho BORA</h3>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nível de estresse final</span>
                  <span className="text-xl font-bold text-green-400">12%</span>
                </div>

                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "12%" }}
                    transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="pt-3 space-y-2 border-t border-green-500/20 relative z-10">
                <p className="text-xs text-green-400 font-semibold">Estado mental:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Clareza e foco constantes</li>
                  <li>• Produtividade sustentável</li>
                  <li>• Relações harmoniosas</li>
                  <li>• Energia e bem-estar</li>
                </ul>
              </div>

              <div className="bg-green-500/10 rounded-xl p-3 text-center relative z-10">
                <p className="text-xs text-green-400 font-medium">
                  "Finalmente tenho controle da minha vida."
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats comparison */}
        <motion.div
          className="bg-muted/30 border border-border/50 rounded-2xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm font-semibold text-center text-foreground">
            A diferença entre os dois caminhos:
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">138%</div>
              <div className="text-xs text-muted-foreground">Redução de estresse</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">12x</div>
              <div className="text-xs text-muted-foreground">Mais paz mental</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">100%</div>
              <div className="text-xs text-muted-foreground">Controle da rotina</div>
            </div>
          </div>
        </motion.div>

        {/* Key insight */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-foreground font-medium">
            A diferença não está em trabalhar menos ou ter menos responsabilidades.
          </p>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Está em ter um <span className="text-green-400 font-semibold">sistema</span> que
            organiza sua mente, alinha suas ações e transforma hábitos caóticos em rotinas sustentáveis.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25"
          >
            <span className="font-semibold">Descobrir o Sistema BORA</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TwoPathsComparison;
