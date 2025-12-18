import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Trophy, Gift, Calendar, Timer, Star } from "lucide-react";

export const AppExplanationStep = () => {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6 px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Como o Bora vai mudar sua vida
        </h2>
        <p className="text-base text-slate-600">
          Três áreas principais que vão transformar sua rotina
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="w-full max-w-3xl mx-auto px-4"
      >
        <Tabs defaultValue="routine" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="routine" className="text-xs sm:text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              Rotina
            </TabsTrigger>
            <TabsTrigger value="completion" className="text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Conclusão
            </TabsTrigger>
            <TabsTrigger value="bonus" className="text-xs sm:text-sm">
              <Gift className="w-4 h-4 mr-1" />
              Bônus
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Routine */}
          <TabsContent value="routine" className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
              {/* Screenshot placeholder */}
              <div className="aspect-video bg-slate-900 rounded-xl mb-4 flex items-center justify-center">
                <Calendar className="w-16 h-16 text-white opacity-50" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Sua Rotina Personalizada
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Timer className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Horários otimizados</p>
                    <p className="text-sm text-slate-700">
                      Hábitos agendados nos seus melhores horários de energia
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Check diário simples</p>
                    <p className="text-sm text-slate-700">
                      Um toque para marcar como feito - sem complicação
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Adaptação inteligente</p>
                    <p className="text-sm text-slate-700">
                      A rotina se ajusta automaticamente à sua realidade
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Completion */}
          <TabsContent value="completion" className="space-y-4">
            <div className="bg-gradient-to-br from-lime-50 to-lime-100 border-2 border-lime-200 rounded-2xl p-6">
              {/* Screenshot placeholder */}
              <div className="aspect-video bg-slate-900 rounded-xl mb-4 flex items-center justify-center">
                <Trophy className="w-16 h-16 text-white opacity-50" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Conclusão de Hábitos
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Sequências motivadoras</p>
                    <p className="text-sm text-slate-700">
                      Veja seus dias consecutivos crescerem e sinta o progresso
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-lime-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Celebração visual</p>
                    <p className="text-sm text-slate-700">
                      Animações especiais quando você completa marcos importantes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-lime-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Estatísticas claras</p>
                    <p className="text-sm text-slate-700">
                      Acompanhe sua taxa de consistência e evolução semanal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Bonus */}
          <TabsContent value="bonus" className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-6">
              {/* Screenshot placeholder */}
              <div className="aspect-video bg-slate-900 rounded-xl mb-4 flex items-center justify-center">
                <Gift className="w-16 h-16 text-white opacity-50" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Área de Bônus
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Recompensas exclusivas</p>
                    <p className="text-sm text-slate-700">
                      Ganhe pontos e desbloqueie benefícios à medida que evolui
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Conquistas especiais</p>
                    <p className="text-sm text-slate-700">
                      Badges e troféus para celebrar suas vitórias
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Conteúdo premium</p>
                    <p className="text-sm text-slate-700">
                      Acesso a dicas, guias e recursos exclusivos para membros
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Bottom Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-center mt-6 px-4"
      >
        <p className="text-sm text-slate-600">
          Tudo isso vai estar disponível para você em alguns minutos
        </p>
      </motion.div>
    </div>
  );
};
