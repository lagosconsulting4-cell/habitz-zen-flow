import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAppMetrics } from "@/hooks/useAppMetrics";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Interface para respostas do onboarding
interface OnboardingAnswers {
  ageRange?: string;
  hasDiagnosis?: string;
  usesMedication?: string;
  energyPeriod?: string;
  challenges?: string[];
  specificChallenge?: string;
  focusLevel?: number;
  motivationLevel?: number;
  overloadLevel?: number;
  clarityLevel?: number;
  selfEsteemLevel?: number;
  dailyTimeCommitment?: string;
  preferredFormats?: string[];
  environment?: string;
  environmentOther?: string;
  email?: string;
  consent?: boolean;
}

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { track, getSessionId } = useAppMetrics();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({
    challenges: [],
    preferredFormats: [],
    focusLevel: 3,
    motivationLevel: 3,
    overloadLevel: 3,
    clarityLevel: 3,
    selfEsteemLevel: 3
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    track("onboarding_started");
  }, [track]);

  useEffect(() => {
    if (currentStep > 1) {
      track("onboarding_step_completed", { step: currentStep - 1 });
    }
  }, [currentStep, track]);

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!answers.ageRange || !answers.hasDiagnosis || !answers.usesMedication || !answers.energyPeriod) {
        toast.error("Por favor, responda todas as perguntas antes de continuar.");
        return;
      }
    }

    if (currentStep === 2) {
      if (!answers.challenges || answers.challenges.length === 0) {
        toast.error("Por favor, selecione pelo menos um desafio.");
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    // Validate step 5
    if (answers.email && !answers.consent) {
      toast.error("Por favor, autorize o envio de emails para continuar.");
      return;
    }

    try {
      const sessionId = getSessionId();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Você precisa estar autenticado para completar o onboarding.");
        navigate("/auth");
        return;
      }

      // Insert onboarding response
      const { error: insertError } = await supabase
        .from("onboarding_responses")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          answers: answers,
          completed_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Mark user as onboarded
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          has_completed_onboarding: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Track completion
      track("onboarding_completed", {
        has_email: !!answers.email,
        challenges_count: answers.challenges?.length || 0
      });

      toast.success("Onboarding concluído com sucesso!");

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      toast.error("Erro ao enviar respostas. Tente novamente.");
    }
  };

  const toggleChallenge = (challenge: string) => {
    const current = answers.challenges || [];
    if (current.includes(challenge)) {
      setAnswers({
        ...answers,
        challenges: current.filter(c => c !== challenge)
      });
    } else {
      setAnswers({
        ...answers,
        challenges: [...current, challenge]
      });
    }
  };

  const toggleFormat = (format: string) => {
    const current = answers.preferredFormats || [];
    if (current.includes(format)) {
      setAnswers({
        ...answers,
        preferredFormats: current.filter(f => f !== format)
      });
    } else {
      setAnswers({
        ...answers,
        preferredFormats: [...current, format]
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] py-8 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-lime-400/10 rounded-full">
              <Sparkles className="w-8 h-8 text-lime-400" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-white mb-2">
            Bem-vindo ao Habitz
          </h1>
          <p className="text-white/60">
            Vamos conhecer você melhor para personalizar sua experiência
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Etapa {currentStep} de {totalSteps}</span>
            <span className="text-lime-400 font-semibold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/10" />
        </div>

        {/* Step Content */}
        <Card className="rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8 mb-6">
          {/* Step 1 - Sobre você */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Sobre você</h2>
                <p className="text-white/60">Vamos começar conhecendo um pouco mais sobre você</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block text-white">
                    Com qual faixa de idade você se identifica?
                  </Label>
                  <RadioGroup value={answers.ageRange} onValueChange={(value) => setAnswers({ ...answers, ageRange: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="13-17" id="age1" />
                      <Label htmlFor="age1" className="font-normal cursor-pointer text-white/80">13-17 anos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="18-24" id="age2" />
                      <Label htmlFor="age2" className="font-normal cursor-pointer text-white/80">18-24 anos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="25-34" id="age3" />
                      <Label htmlFor="age3" className="font-normal cursor-pointer text-white/80">25-34 anos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="35-44" id="age4" />
                      <Label htmlFor="age4" className="font-normal cursor-pointer text-white/80">35-44 anos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="45+" id="age5" />
                      <Label htmlFor="age5" className="font-normal cursor-pointer text-white/80">45+ anos</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block text-white">
                    Você já recebeu diagnóstico formal de TDAH?
                  </Label>
                  <RadioGroup value={answers.hasDiagnosis} onValueChange={(value) => setAnswers({ ...answers, hasDiagnosis: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="diag1" />
                      <Label htmlFor="diag1" className="font-normal cursor-pointer text-white/80">Ainda não</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="suspeito" id="diag2" />
                      <Label htmlFor="diag2" className="font-normal cursor-pointer text-white/80">Suspeito que sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="diag3" />
                      <Label htmlFor="diag3" className="font-normal cursor-pointer text-white/80">Sim, confirmadíssimo</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block text-white">
                    Atualmente faz uso de medicação?
                  </Label>
                  <RadioGroup value={answers.usesMedication} onValueChange={(value) => setAnswers({ ...answers, usesMedication: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="med1" />
                      <Label htmlFor="med1" className="font-normal cursor-pointer text-white/80">Não</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="diariamente" id="med2" />
                      <Label htmlFor="med2" className="font-normal cursor-pointer text-white/80">Sim, diariamente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="especificos" id="med3" />
                      <Label htmlFor="med3" className="font-normal cursor-pointer text-white/80">Sim, em dias específicos</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block text-white">
                    Em qual período do dia você sente maior energia?
                  </Label>
                  <RadioGroup value={answers.energyPeriod} onValueChange={(value) => setAnswers({ ...answers, energyPeriod: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manha" id="energy1" />
                      <Label htmlFor="energy1" className="font-normal cursor-pointer text-white/80">Manhã</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tarde" id="energy2" />
                      <Label htmlFor="energy2" className="font-normal cursor-pointer text-white/80">Tarde</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="noite" id="energy3" />
                      <Label htmlFor="energy3" className="font-normal cursor-pointer text-white/80">Noite</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="variavel" id="energy4" />
                      <Label htmlFor="energy4" className="font-normal cursor-pointer text-white/80">Variável</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Desafios */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Seus maiores desafios</h2>
                <p className="text-white/60">Selecione todos que se aplicam ao seu dia a dia</p>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold mb-3 block text-white">
                  O que mais atrapalha sua rotina hoje?
                </Label>

                <div className="space-y-3">
                  {[
                    'Procrastinação',
                    'Desorganização mental',
                    'Desorganização física',
                    'Falta de foco',
                    'Impulsividade',
                    'Sono/desgaste',
                    'Relacionamentos/Comunicação',
                    'Ansiedade/sobrecarga'
                  ].map((challenge) => (
                    <div key={challenge} className="flex items-center space-x-2">
                      <Checkbox
                        id={challenge}
                        checked={answers.challenges?.includes(challenge)}
                        onCheckedChange={() => toggleChallenge(challenge)}
                      />
                      <Label htmlFor={challenge} className="font-normal cursor-pointer text-white/80">
                        {challenge}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Label htmlFor="specific" className="text-base font-semibold mb-2 block text-white">
                    Existe algo específico que gostaria de mudar? (Opcional)
                  </Label>
                  <Textarea
                    id="specific"
                    placeholder="Descreva aqui..."
                    value={answers.specificChallenge || ''}
                    onChange={(e) => setAnswers({ ...answers, specificChallenge: e.target.value })}
                    className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 - Como você se sente */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Como você se sente hoje?</h2>
                <p className="text-white/60">Avalie de 1 (Nada) a 5 (Muito)</p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-base font-semibold text-white">Foco no dia a dia</Label>
                    <span className="text-2xl font-bold text-lime-400">{answers.focusLevel}</span>
                  </div>
                  <Slider
                    value={[answers.focusLevel || 3]}
                    onValueChange={([value]) => setAnswers({ ...answers, focusLevel: value })}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>Nada</span>
                    <span>Muito</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-base font-semibold text-white">Motivação para começar</Label>
                    <span className="text-2xl font-bold text-lime-400">{answers.motivationLevel}</span>
                  </div>
                  <Slider
                    value={[answers.motivationLevel || 3]}
                    onValueChange={([value]) => setAnswers({ ...answers, motivationLevel: value })}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>Nada</span>
                    <span>Muito</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-base font-semibold text-white">Nível de sobrecarga</Label>
                    <span className="text-2xl font-bold text-lime-400">{answers.overloadLevel}</span>
                  </div>
                  <Slider
                    value={[answers.overloadLevel || 3]}
                    onValueChange={([value]) => setAnswers({ ...answers, overloadLevel: value })}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>Nada</span>
                    <span>Muito</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-base font-semibold text-white">Clareza de objetivos</Label>
                    <span className="text-2xl font-bold text-lime-400">{answers.clarityLevel}</span>
                  </div>
                  <Slider
                    value={[answers.clarityLevel || 3]}
                    onValueChange={([value]) => setAnswers({ ...answers, clarityLevel: value })}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>Nada</span>
                    <span>Muito</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-base font-semibold text-white">Autoestima e autoconfiança</Label>
                    <span className="text-2xl font-bold text-lime-400">{answers.selfEsteemLevel}</span>
                  </div>
                  <Slider
                    value={[answers.selfEsteemLevel || 3]}
                    onValueChange={([value]) => setAnswers({ ...answers, selfEsteemLevel: value })}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>Nada</span>
                    <span>Muito</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 - Preferências */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Preferências de aprendizado</h2>
                <p className="text-white/60">Como você prefere receber orientações?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block text-white">
                    Quanto tempo por dia você pode dedicar para o plano?
                  </Label>
                  <RadioGroup value={answers.dailyTimeCommitment} onValueChange={(value) => setAnswers({ ...answers, dailyTimeCommitment: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5-10" id="time1" />
                      <Label htmlFor="time1" className="font-normal cursor-pointer text-white/80">5-10 minutos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="10-20" id="time2" />
                      <Label htmlFor="time2" className="font-normal cursor-pointer text-white/80">10-20 minutos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="20-30" id="time3" />
                      <Label htmlFor="time3" className="font-normal cursor-pointer text-white/80">20-30 minutos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30+" id="time4" />
                      <Label htmlFor="time4" className="font-normal cursor-pointer text-white/80">30+ minutos</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block text-white">
                    Qual formato funciona melhor para você?
                  </Label>
                  <div className="space-y-3">
                    {['Vídeo curto', 'Áudio guia', 'Texto objetivo', 'Checklist/Planilha'].map((format) => (
                      <div key={format} className="flex items-center space-x-2">
                        <Checkbox
                          id={format}
                          checked={answers.preferredFormats?.includes(format)}
                          onCheckedChange={() => toggleFormat(format)}
                        />
                        <Label htmlFor={format} className="font-normal cursor-pointer text-white/80">
                          {format}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block text-white">
                    Em qual ambiente você pretende praticar os hábitos?
                  </Label>
                  <RadioGroup value={answers.environment} onValueChange={(value) => setAnswers({ ...answers, environment: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="casa" id="env1" />
                      <Label htmlFor="env1" className="font-normal cursor-pointer text-white/80">Casa</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="trabalho" id="env2" />
                      <Label htmlFor="env2" className="font-normal cursor-pointer text-white/80">Trabalho/Estudo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="externo" id="env3" />
                      <Label htmlFor="env3" className="font-normal cursor-pointer text-white/80">Espaço externo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="outro" id="env4" />
                      <Label htmlFor="env4" className="font-normal cursor-pointer text-white/80">Outro</Label>
                    </div>
                  </RadioGroup>

                  {answers.environment === 'outro' && (
                    <Input
                      placeholder="Especifique..."
                      value={answers.environmentOther || ''}
                      onChange={(e) => setAnswers({ ...answers, environmentOther: e.target.value })}
                      className="mt-3 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5 - Email */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Fique por dentro</h2>
                <p className="text-white/60">Quer receber dicas e novidades por e-mail?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-base font-semibold text-white mb-2 block">
                    E-mail (opcional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={answers.email || ''}
                    onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  <p className="text-sm text-white/40 mt-1">
                    Não enviamos spam e você pode sair quando quiser.
                  </p>
                </div>

                {answers.email && (
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consent"
                      checked={answers.consent || false}
                      onCheckedChange={(checked) => setAnswers({ ...answers, consent: checked as boolean })}
                    />
                    <Label htmlFor="consent" className="font-normal cursor-pointer text-sm text-white/80">
                      Autorizo o Habitz a enviar dicas e orientações por e-mail.
                    </Label>
                  </div>
                )}

                <div className="bg-lime-400/10 border border-lime-400/30 p-4 rounded-2xl mt-6">
                  <p className="text-sm text-white/80">
                    <strong className="text-lime-400">Observação:</strong> Sem email? Tudo bem — você pode adicionar depois nas configurações.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>
          )}

          <div className="flex-1" />

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-lime-400 text-black hover:bg-lime-500 font-semibold"
            >
              Avançar
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-lime-400 text-black hover:bg-lime-500 font-semibold"
              size="lg"
            >
              Começar a usar o Habitz
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;
