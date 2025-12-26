import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Star, Loader2, HeartCrack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CANCELLATION_REASONS = [
  { value: "too_expensive", label: "Muito caro" },
  { value: "not_using", label: "Não estou usando" },
  { value: "missing_features", label: "Falta de funcionalidades" },
  { value: "technical_issues", label: "Problemas técnicos" },
  { value: "found_alternative", label: "Encontrei uma alternativa" },
  { value: "temporary_break", label: "Pausa temporária" },
  { value: "other", label: "Outro motivo" },
];

const CancelSubscription = () => {
  const navigate = useNavigate();
  const [reason, setReason] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleStarClick = (star: number) => {
    setRating(star);
  };

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Por favor, selecione um motivo para o cancelamento");
      return;
    }

    if (rating === 0) {
      toast.error("Por favor, avalie sua experiência");
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    setShowConfirmDialog(false);

    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: {
          reason,
          rating,
          feedbackText: feedbackText.trim() || null,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Erro ao cancelar assinatura");
      }

      toast.success(data.message || "Assinatura cancelada com sucesso");

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao cancelar assinatura. Tente novamente."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-navbar transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 pb-6 max-w-2xl"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <Button
          variant="ghost"
          className="mb-6 -ml-2"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartCrack className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Cancelar Assinatura
          </h1>
          <p className="text-muted-foreground">
            Sentiremos sua falta! Nos ajude a melhorar compartilhando sua experiência.
          </p>
        </div>

        <Card className="rounded-2xl bg-card border border-border p-6 space-y-6">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-foreground font-semibold">
              Por que você está cancelando? *
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason" className="bg-secondary border-border">
                <SelectValue placeholder="Selecione um motivo" />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">
              Como você avalia sua experiência? *
            </Label>
            <div className="flex gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {rating === 0 && "Clique nas estrelas para avaliar"}
              {rating === 1 && "Muito ruim"}
              {rating === 2 && "Ruim"}
              {rating === 3 && "Regular"}
              {rating === 4 && "Bom"}
              {rating === 5 && "Excelente"}
            </p>
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-foreground font-semibold">
              Compartilhe mais detalhes (opcional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="O que poderíamos ter feito melhor? Como podemos melhorar?"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="bg-secondary border-border min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {feedbackText.length}/500
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !reason || rating === 0}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Confirmar Cancelamento"
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Sua assinatura será cancelada imediatamente e você perderá o acesso aos recursos premium.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação cancelará sua assinatura imediatamente. Você perderá o acesso a todos os recursos premium do Habitz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter assinatura</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, cancelar assinatura
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CancelSubscription;
