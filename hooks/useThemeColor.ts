/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from "@/constants/Colors";

export function useThemeColor(
  props: { color?: string },
  colorName: keyof typeof Colors,
) {
  const color = Colors[colorName];
  return typeof color === "string" ? color : "#11181C";
}
