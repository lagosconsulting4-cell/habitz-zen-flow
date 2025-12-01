/**
 * Stub para camada futura de entrega de notificações (push/email/SMS).
 * Hoje apenas loga o agendamento pretendido. Pode ser substituído por worker/API.
 */
export type DeliveryChannel = "push" | "email" | "sms";

interface ScheduleInput {
  habitId: string;
  userId?: string;
  time: string; // HH:MM
  channel: DeliveryChannel;
  message: string;
}

export const useSchedulerStub = () => {
  const schedule = async (input: ScheduleInput) => {
    if (import.meta.env.DEV) {
      console.info("Scheduler stub:", input);
    }
    // noop
    return true;
  };

  return { schedule };
};

export default useSchedulerStub;
