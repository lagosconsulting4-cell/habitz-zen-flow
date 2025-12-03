export interface HabitFormTheme {
  background: string;
  overlay: string;
  headerBorder: string;
  headerIcon: string;
  headerText: string;
  bodyText: string;
  bodyTextSecondary: string;
  sectionTitle: string;
  input: string;
  buttonActive: string;
  buttonInactive: string;
  container: string;
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
      sectionTitle: "text-slate-500",
      input: "bg-slate-900 border-slate-700 text-white placeholder:text-slate-600",
      buttonActive: "bg-emerald-500 text-white hover:bg-emerald-600",
      buttonInactive: "bg-slate-800 text-slate-300 hover:bg-slate-700",
      container: "bg-slate-900 border-slate-800",
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
    sectionTitle: "text-gray-500",
    input: "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
    buttonActive: "bg-emerald-500 text-white hover:bg-emerald-600",
    buttonInactive: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    container: "bg-white border-gray-200",
  };
};
