import { useRef, useState } from "react";
import { Pressable, View, Text, TextInput, StyleSheet } from "react-native";
import { IIcon } from "./Icons";
import { colors, fonts } from "../theme/tokens";

export function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  error,
  hint,
  rightSlot,
  returnKeyType,
  onSubmitEditing,
  onFocus,
  inputRef,
}) {
  const [focused, setFocused] = useState(false);
  const fallbackInputRef = useRef(null);
  const resolvedInputRef = inputRef ?? fallbackInputRef;

  return (
    <View style={styles.field}>
      {label != null && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={[
          styles.row,
          {
            borderColor:
              error != null
                ? colors.red
                : focused
                  ? colors.ink
                  : "rgba(15,17,26,0.18)",
          },
        ]}
        onPress={() => resolvedInputRef.current?.focus()}
        accessible={false}
      >
        {icon != null && (
          <IIcon
            name={icon}
            size={18}
            strokeWidth={1.8}
            color="rgba(15,17,26,0.6)"
          />
        )}
        <TextInput
          ref={resolvedInputRef}
          style={styles.input}
          accessibilityLabel={label ?? placeholder}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(15,17,26,0.35)"
          secureTextEntry={type === "password"}
          keyboardType={type === "email" ? "email-address" : "default"}
          autoCapitalize={
            type === "email" || type === "password" ? "none" : "words"
          }
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => setFocused(false)}
        />
        {rightSlot}
      </Pressable>
      {(error != null || hint != null) && (
        <Text
          style={[
            styles.meta,
            { color: error != null ? colors.red : "rgba(15,17,26,0.62)" },
          ]}
        >
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: {
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    color: colors.ink,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.ink,
    minWidth: 0,
    padding: 0,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    marginTop: 4,
    paddingLeft: 2,
  },
});
