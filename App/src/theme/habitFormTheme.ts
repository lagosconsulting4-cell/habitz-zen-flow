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
}

export const getHabitFormTheme = (isDarkMode: boolean): HabitFormTheme => {
  if (isDarkMode) {
    return {
      background: "bg-slate-950",
      overlay: "bg-black/90",
      headerBorder: "border-slate-800",
      headerIcon: "hover:bg-slate-800 text-slate-300",
      headerText: "text-white",
      bodyText: "text-white",
      bodyTextSecondary: "text-slate-400",
      bodyTextMuted: "text-slate-500",
      sectionTitle: "text-slate-500",
      input: "bg-slate-900 border-slate-700 text-white placeholder:text-slate-600",
      buttonActive: "bg-lime-500 text-black hover:bg-lime-600",
      buttonInactive: "bg-slate-800 text-slate-300 hover:bg-slate-700",
      card: "bg-slate-900 border-slate-800",
      iconBg: "bg-slate-800",
      iconColor: "text-slate-300",
      healthIcon: "text-lime-500",
      categoryPill: {
        activeBg: "rgb(132 204 22)",
        inactiveBg: "rgb(30 41 59)",
        activeIcon: "rgb(255 255 255)",
        inactiveIcon: "rgb(148 163 184)",
      },
      taskButton: {
        bg: "bg-slate-800",
        text: "text-white",
        iconBg: "bg-slate-700",
        iconColor: "text-slate-300",
        chevron: "text-slate-400",
        shadow: "shadow-lg shadow-slate-900",
      },
      stepper: {
        inactiveCircle: "rgba(255,255,255,0.15)",
        inactiveConnector: "rgba(255,255,255,0.1)",
        inactiveIcon: "text-slate-500",
      },
      periodIcon: {
        selectedBg: "bg-primary",
        selectedText: "text-white",
        unselectedText: "text-slate-500",
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
      bg: "bg-gray-50",
      text: "text-gray-900",
      iconBg: "bg-gray-200",
      iconColor: "text-gray-600",
      chevron: "text-gray-500",
      shadow: "shadow-lg shadow-gray-300",
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
  };
};
