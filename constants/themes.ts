export const themes = {
  light: {
    background: "#FFFFFF",
    surface: "#F8F9FA",
    primary: "#6366F1",
    primaryDark: "#4F46E5",
    text: "#1F2937",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    success: "#10B981",
    error: "#EF4444",
    shadow: "#000000",
    cardBackground: "#FFFFFF",
  },
  dark: {
    background: "#111827",
    surface: "#1F2937",
    primary: "#818CF8",
    primaryDark: "#6366F1",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    border: "#374151",
    success: "#34D399",
    error: "#F87171",
    shadow: "#000000",
    cardBackground: "#374151",
  },
};

export type Theme = typeof themes.light;
