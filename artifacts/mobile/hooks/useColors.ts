import colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

/**
 * Returns the design tokens for the current resolved theme.
 * Reads the user's theme preference (light/dark/system) from ThemeContext.
 */
export function useColors() {
  const { resolvedTheme } = useTheme();
  const palette = resolvedTheme === "light" ? colors.light : colors.dark;
  return { ...palette, radius: colors.radius };
}
