import React from "react";
import { Image, View, Text } from "react-native";
import { colors, fonts } from "../theme/tokens";

const impaktLogo = require("../../assets/impakt-logo.webp");
const LOGO_ASPECT_RATIO = 230 / 74;

export function ImpaktLogo({
  size = 28,
  dark = true,
  dotColor = colors.red,
  width,
  height,
  style,
}) {
  if (dark && dotColor === colors.red) {
    const imageHeight = height ?? Math.round(size * 1.35);
    const imageWidth = width ?? Math.round(imageHeight * LOGO_ASPECT_RATIO);

    return (
      <Image
        source={impaktLogo}
        style={[{ width: imageWidth, height: imageHeight }, style]}
        resizeMode="contain"
      />
    );
  }

  const fg = dark ? colors.ink : colors.cream;
  const barH = Math.max(4, Math.round(size * 0.18));
  const dotSize = Math.round(size * 0.32);
  const gap = Math.round(size * 0.08);
  const innerGap = Math.round(size * 0.14);

  return (
    <View style={[{ alignItems: "stretch", gap }, style]}>
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
            backgroundColor: dotColor,
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
