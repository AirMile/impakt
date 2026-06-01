import React from "react";
import { View, Text } from "react-native";
import { colors, fonts } from "../theme/tokens";

export function ImpaktLogo({ size = 28, dark = true }) {
  const fg = dark ? colors.ink : colors.cream;
  const barH = Math.max(4, Math.round(size * 0.18));
  const dotSize = Math.round(size * 0.32);
  const gap = Math.round(size * 0.08);
  const innerGap = Math.round(size * 0.14);

  return (
    <View style={{ alignItems: "stretch", gap }}>
      <Text
        style={{
          fontFamily: fonts.header,
          fontSize: size,
          letterSpacing: size * 0.04,
          color: fg,
          lineHeight: size * 0.95,
        }}
      >
        IMPAKT
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: innerGap }}
      >
        <View
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: colors.red,
          }}
        />
        <View
          style={{
            flex: 1,
            height: barH,
            backgroundColor: fg,
            borderRadius: 1,
          }}
        />
      </View>
    </View>
  );
}
