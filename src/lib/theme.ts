// Hear Me — design tokens. Mirrors /app/design_guidelines.json.

export const colors = {
  background: "#0B0710",
  surface: "#140D1C",
  surfaceElevated: "#1E1428",
  border: "#2A1B38",
  borderStrong: "#3A2548",
  text: "#FFFFFF",
  textSecondary: "#A89FB4",
  textMuted: "#6E637C",
  primary: "#E03C68",
  primaryDeep: "#7A1B6C",
  gold: "#D4AF37",
  success: "#5BD9A5",
  danger: "#E03C68",
  pass: "#6E637C",
  voiceActive: "#E03C68",
} as const;

export const gradient = {
  primary: ["#7A1B6C", "#E03C68"] as const,
  premium: ["#D4AF37", "#7A1B6C"] as const,
  dark: ["#1E1428", "#0B0710"] as const,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 9999,
};

export const fonts = {
  heading: "Cormorant Garamond, Georgia, serif",
  body: "System",
};
