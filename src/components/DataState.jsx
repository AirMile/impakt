import React from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { colors, fonts, surfaces } from "../theme/tokens";

// Toont een spinner tijdens het laden en een foutmelding + retry bij een fout;
// anders de children. Bedoeld als wrapper rond primaire scherm-content.
//
//   <DataState loading={loading} error={error} onRetry={reload}>
//     <FlatList ... />
//   </DataState>
export function DataState({
  loading,
  error,
  onRetry,
  children,
  loadingLabel,
  errorLabel = "Er ging iets mis. Probeer het opnieuw.",
}) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.ink} />
        {loadingLabel ? <Text style={styles.label}>{loadingLabel}</Text> : null}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorLabel}>{error.message || errorLabel}</Text>
        {onRetry ? (
          <Pressable
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retry,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.retryLabel}>Opnieuw proberen</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 14,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: surfaces.muted,
    textAlign: "center",
  },
  errorLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.red,
    textAlign: "center",
  },
  retry: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 9999,
    backgroundColor: colors.ink,
  },
  retryLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.cream,
  },
});
