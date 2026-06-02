import React, { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { MotiView } from "moti";
import { toast } from "../lib/toast";
import { colors, fonts } from "../theme/tokens";

export function ToastHost() {
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    const unsub = toast.subscribe((msg) => {
      setMessage(msg);
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 2000);
    });
    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  if (!message) return null;

  return (
    <MotiView
      animate={{ opacity: visible ? 1 : 0, translateY: visible ? 0 : 8 }}
      transition={{ type: "timing", duration: 200 }}
      style={styles.pill}
      pointerEvents="none"
    >
      <Text style={styles.label}>{message}</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 9999,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.cream,
  },
});
