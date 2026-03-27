export interface HabitFormTheme {
  background: string;
  overlay: string;
  headerBorder: string;
  headerIcon: string;
  headerText: string;
  bodyText: string;
  bodyTextSecondary: string;
  bodyTextMuted: string;
  sectionTitle: string;
  input: string;
  buttonActive: string;
  buttonInactive: string;
  card: string;
  iconBg: string;
  iconColor: string;
  healthIcon: string;
  categoryPill: {
    activeBg: string;
    inactiveBg: string;
    activeIcon: string;
    inactiveIcon: string;
  };
  taskButton: {
    bg: string;
    text: string;
    iconBg: string;
    iconColor: string;
    chevron: string;
    shadow: string;
  };
  stepper: {
    inactiveCircle: string;
    inactiveConnector: string;
    inactiveIcon: string;
  };
  periodIcon: {
    selectedBg: string;
    selectedText: string;
    unselectedText: string;
  };
  customHabitCard: {
    bg: string;
    border: string;
    text: string;
    subtitle: string;
    icon: string;
    chevron: string;
  };
  separator: string;
  categoryLabel: string;
  stepperNumber: {
    activeBg: string;
    activeText: string;
    inactiveBg: string;
    inactiveText: string;
  };
  taskDescription: string;
  detailsCard: {
    bg: string;
    border: string;
    activeBorder: string;
    activeShadow: string;
  };
  dayPill: {
    activeBg: string;
    activeBorder: string;
    activeText: string;
    inactiveBg: string;
    inactiveBorder: string;
    inactiveText: string;
  };
  reminderCard: {
    bg: string;
    border: string;
    timeText: string;
    subtitleText: string;
    iconColor: string;
  };
  ctaButton: {
    bg: string;
    text: string;
    shadow: string;
    disabledBg: string;
    disabledText: string;
  };
}

export const getHabitFormTheme = (isDarkMode: boolean): HabitFormTheme => {
  if (isDarkMode) {
    return {
      background: "bg-black",
      overlay: "bg-black/90",
      headerBorder: "border-neutral-800",
      headerIcon: "hover:bg-neutral-800 text-neutral-300",
      headerText: "text-white",
      bodyText: "text-white",
      bodyTextSecondary: "text-neutral-400",
      bodyTextMuted: "text-neutral-500",
      sectionTitle: "text-neutral-500",
      input: "bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600",
      buttonActive: "bg-lime-500 text-black hover:bg-lime-600",
      buttonInactive: "bg-neutral-800 text-neutral-300 hover:bg-neutral-700",
      card: "bg-neutral-900 border-neutral-800",
      iconBg: "bg-neutral-800",
      iconColor: "text-neutral-300",
      healthIcon: "text-lime-500",
      categoryPill: {
        activeBg: "rgb(132 204 22)",
        inactiveBg: "rgb(38 38 38)",
        activeIcon: "rgb(255 255 255)",
        inactiveIcon: "rgb(148 163 184)",
      },
      taskButton: {
        bg: "rgb(28, 28, 28)",
        text: "text-white",
        iconBg: "bg-neutral-700",
        iconColor: "text-neutral-300",
        chevron: "text-neutral-500",
        shadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
      },
      stepper: {
        inactiveCircle: "rgba(255,255,255,0.15)",
        inactiveConnector: "rgba(255,255,255,0.1)",
        inactiveIcon: "text-neutral-500",
      },
      periodIcon: {
        selectedBg: "bg-primary",
        selectedText: "text-white",
        unselectedText: "text-neutral-500",
      },
      customHabitCard: {
        bg: "rgba(38, 38, 38, 0.7)",
        border: "rgba(163, 230, 53, 0.3)",
        text: "#FFFFFF",
        subtitle: "rgba(163, 163, 163, 1)",
        icon: "#A3E635",
        chevron: "rgba(163, 163, 163, 1)",
      },
      separator: "rgba(255, 255, 255, 0.08)",
      categoryLabel: "rgba(148, 163, 184, 0.7)",
      stepperNumber: {
        activeBg: "#A3E635",
        activeText: "#FFFFFF",
        inactiveBg: "rgba(255, 255, 255, 0.1)",
        inactiveText: "rgba(255, 255, 255, 0.4)",
      },
      taskDescription: "rgba(148, 163, 184, 0.8)",
      detailsCard: {
        bg: "rgb(28, 28, 28)",
        border: "rgba(255, 255, 255, 0.06)",
        activeBorder: "rgba(163, 230, 53, 0.6)",
        activeShadow: "0 0 16px rgba(163, 230, 53, 0.15), 0 0 4px rgba(163, 230, 53, 0.3)",
      },
      dayPill: {
        activeBg: "transparent",
        activeBorder: "rgba(163, 230, 53, 0.7)",
        activeText: "#A3E635",
        inactiveBg: "rgb(38, 38, 38)",
        inactiveBorder: "rgba(255, 255, 255, 0.06)",
        inactiveText: "rgba(255, 255, 255, 0.5)",
      },
      reminderCard: {
        bg: "rgb(28, 28, 28)",
        border: "rgba(255, 255, 255, 0.06)",
        timeText: "#FFFFFF",
        subtitleText: "rgba(163, 163, 163, 1)",
        iconColor: "#A3E635",
      },
      ctaButton: {
        bg: "linear-gradient(135deg, #A3E635 0%, #84CC16 100%)",
        text: "#000000",
        shadow: "0 0 30px rgba(163, 230, 53, 0.3), 0 4px 16px rgba(163, 230, 53, 0.2)",
        disabledBg: "rgba(163, 230, 53, 0.2)",
        disabledText: "rgba(0, 0, 0, 0.4)",
      },
    };
  }

  return {
    background: "bg-white",
    overlay: "bg-black/80",
    headerBorder: "border-gray-200",
    headerIcon: "hover:bg-gray-100 text-gray-700",
    headerText: "text-gray-900",
    bodyText: "text-gray-900",
    bodyTextSecondary: "text-gray-600",
    bodyTextMuted: "text-gray-600",
    sectionTitle: "text-gray-600",
    input: "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
    buttonActive: "bg-lime-500 text-white hover:bg-lime-600",
    buttonInactive: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    card: "bg-white border-gray-200",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-700",
    healthIcon: "text-lime-500",
    categoryPill: {
      activeBg: "rgb(132 204 22)",
      inactiveBg: "rgb(243 244 246)",
      activeIcon: "rgb(255 255 255)",
      inactiveIcon: "rgb(107 114 128)",
    },
    taskButton: {
      bg: "rgb(249, 250, 251)",
      text: "text-gray-900",
      iconBg: "bg-gray-200",
      iconColor: "text-gray-600",
      chevron: "text-gray-500",
      shadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    },
    stepper: {
      inactiveCircle: "rgba(0,0,0,0.2)",
      inactiveConnector: "rgba(0,0,0,0.15)",
      inactiveIcon: "text-gray-400",
    },
    periodIcon: {
      selectedBg: "bg-primary",
      selectedText: "text-white",
      unselectedText: "text-gray-400",
    },
    customHabitCard: {
      bg: "#FFFFFF",
      border: "rgba(132, 204, 22, 0.35)",
      text: "#1F2937",
      subtitle: "#6B7280",
      icon: "#65A30D",
      chevron: "#9CA3AF",
    },
    separator: "rgba(0, 0, 0, 0.08)",
    categoryLabel: "rgba(107, 114, 128, 0.8)",
    stepperNumber: {
      activeBg: "#84CC16",
      activeText: "#FFFFFF",
      inactiveBg: "#E2E8F0",
      inactiveText: "#64748B",
    },
    taskDescription: "#9CA3AF",
    detailsCard: {
      bg: "rgb(249, 250, 251)",
      border: "rgba(0, 0, 0, 0.06)",
      activeBorder: "rgba(132, 204, 22, 0.6)",
      activeShadow: "0 0 12px rgba(132, 204, 22, 0.12), 0 0 4px rgba(132, 204, 22, 0.2)",
    },
    dayPill: {
      activeBg: "transparent",
      activeBorder: "rgba(132, 204, 22, 0.7)",
      activeText: "#65A30D",
      inactiveBg: "rgb(243, 244, 246)",
      inactiveBorder: "rgba(0, 0, 0, 0.06)",
      inactiveText: "rgba(0, 0, 0, 0.4)",
    },
    reminderCard: {
      bg: "rgb(249, 250, 251)",
      border: "rgba(0, 0, 0, 0.06)",
      timeText: "#1F2937",
      subtitleText: "#6B7280",
      iconColor: "#65A30D",
    },
    ctaButton: {
      bg: "linear-gradient(135deg, #84CC16 0%, #65A30D 100%)",
      text: "#FFFFFF",
      shadow: "0 0 20px rgba(132, 204, 22, 0.2), 0 4px 12px rgba(132, 204, 22, 0.15)",
      disabledBg: "rgba(132, 204, 22, 0.15)",
      disabledText: "rgba(0, 0, 0, 0.3)",
    },
  };
};
