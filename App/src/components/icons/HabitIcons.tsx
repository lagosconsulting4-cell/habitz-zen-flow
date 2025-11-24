import { SVGProps } from "react";

export type HabitIconKey =
  | "run"
  | "cycle"
  | "swim"
  | "stairs"
  | "meditate"
  | "journal"
  | "gratitude"
  | "meal"
  | "water"
  | "no_fast_food"
  | "sleep"
  | "no_screens"
  | "plan"
  | "deep_work"
  | "call_family"
  | "detox"
  | "heart";

type IconProps = SVGProps<SVGSVGElement>;

const createIcon = (paths: JSX.Element[], viewBox = "0 0 24 24") => (props: IconProps) => (
  <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    {paths}
  </svg>
);

export const HabitIcons: Record<HabitIconKey, (props: IconProps) => JSX.Element> = {
  run: createIcon([
    <path key="1" d="M13.5 5.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />,
    <path key="2" d="m10 20 2-6 3-2 2 3" />,
    <path key="3" d="m6.5 16 3.5 1 2-6-3-1-1.5 3" />,
  ]),
  cycle: createIcon([
    <circle key="1" cx="6" cy="18" r="3" />,
    <circle key="2" cx="18" cy="18" r="3" />,
    <path key="3" d="M6 18h6l-3-8 6 2 3 6" />,
    <path key="4" d="M12 10h4" />,
  ]),
  swim: createIcon([
    <path key="1" d="M2 16s2-2 6-2 6 2 8 2 4-2 4-2" />,
    <path key="2" d="M10 12c1.5-1 2.5-1 4 0s2.5 1 4 0" />,
    <path key="3" d="m9 8 2 2 2-2" />,
  ]),
  stairs: createIcon([
    <path key="1" d="M4 18h4v-4h4v-4h4V6" />,
    <path key="2" d="M4 22h16" />,
  ]),
  meditate: createIcon([
    <circle key="1" cx="12" cy="6" r="2" />,
    <path key="2" d="M9 10.5s1.5 1 3 1 3-1 3-1" />,
    <path key="3" d="M10 13 8 16l2 2" />,
    <path key="4" d="M14 13l2 3-2 2" />,
    <path key="5" d="M11 18h2" />,
  ]),
  journal: createIcon([
    <rect key="1" x="5" y="4" width="12" height="16" rx="2" />,
    <path key="2" d="M9 8h6" />,
    <path key="3" d="M9 12h6" />,
    <path key="4" d="M9 16h3" />,
  ]),
  gratitude: createIcon([
    <path key="1" d="M12 21s-5-3.5-7-7a4 4 0 1 1 7-3 4 4 0 1 1 7 3c-2 3.5-7 7-7 7Z" />,
  ]),
  meal: createIcon([
    <path key="1" d="M7 4v16" />,
    <path key="2" d="M11 4v5" />,
    <path key="3" d="M11 15v5" />,
    <path key="4" d="M17 4c0 4-2 4-2 8 0 2 2 2 2 4" />,
    <path key="5" d="M15 4h4" />,
  ]),
  water: createIcon([
    <path key="1" d="M12 3s4 5 4 9a4 4 0 0 1-8 0c0-4 4-9 4-9Z" />,
  ]),
  no_fast_food: createIcon([
    <path key="1" d="M4 14h12" />,
    <path key="2" d="M6 18h8" />,
    <path key="3" d="M10 6h4l1 8H9Z" />,
    <path key="4" d="M3 3 21 21" />,
  ]),
  sleep: createIcon([
    <path key="1" d="M8 5a6 6 0 1 0 8 8" />,
    <path key="2" d="M15 5h3l-2 2h2" />,
    <path key="3" d="M17 9h2l-1.5 1.5H19" />,
  ]),
  no_screens: createIcon([
    <rect key="1" x="4" y="5" width="16" height="12" rx="2" />,
    <path key="2" d="M8 19h8" />,
    <path key="3" d="M3 3 21 21" />,
  ]),
  plan: createIcon([
    <rect key="1" x="6" y="4" width="12" height="16" rx="2" />,
    <path key="2" d="M9 8h6" />,
    <path key="3" d="M9 12h6" />,
    <path key="4" d="M9 16h4" />,
  ]),
  deep_work: createIcon([
    <path key="1" d="M4 8h16" />,
    <path key="2" d="M4 16h10" />,
    <path key="3" d="M10 12h10" />,
    <path key="4" d="M6 4v4" />,
    <path key="5" d="M12 4v4" />,
  ]),
  call_family: createIcon([
    <path key="1" d="M6 5a3 3 0 1 1 6 0v2H6Z" />,
    <path key="2" d="M15 19c-2 0-4-1-4-3v-2c0-1 1-2 2-2h4c1 0 2 1 2 2v2c0 2-2 3-4 3Z" />,
    <path key="3" d="M3 11s2 1 5 1" />,
  ]),
  detox: createIcon([
    <path key="1" d="M6 5h12" />,
    <path key="2" d="M9 5v14" />,
    <path key="3" d="M15 5v10" />,
    <path key="4" d="M6 19h8" />,
    <path key="5" d="M11 9h4" />,
  ]),
  heart: createIcon([
    <path key="1" d="M12 21s-5-3.5-7-7a4 4 0 1 1 7-3 4 4 0 1 1 7 3c-2 3.5-7 7-7 7Z" />,
  ]),
};

export const getHabitIcon = (key?: HabitIconKey | null) => {
  if (!key) return null;
  return HabitIcons[key] ?? null;
};
