import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MotiView } from "moti";
import Svg, { Circle, Path } from "react-native-svg";
import { IIcon } from "../Icons";
import { REACTION_COLORS } from "../../lib/reactionMeta";
import { colors, fonts } from "../../theme/tokens";

const KEYS = ["smile", "meh", "frown"];
const SPRING = { type: "spring", stiffness: 260, damping: 18 };
const LABELS = { smile: "Blij", meh: "Neutraal", frown: "Verdrietig" };
const STANCE = { smile: "Eens", meh: "Twijfel", frown: "Oneens" };

// Cirkelvorm met percentage — vervangt de knop na stemmen
function PctCircle({ color, borderColor, value, light }) {
  return (
    <View style={[s.pctCircle, { borderColor }]}>
      <Text style={[s.pctNum, light && s.shadow, { color }]}>{value}%</Text>
    </View>
  );
}

// ── V1: Groter + label eronder ──────────────────────────────────────────────

export function ReactionLabeled({
  reaction,
  onReact,
  reactions,
  vertical = false,
  light = false,
}) {
  const voted = reaction != null;
  const stroke = light ? colors.cream : colors.ink;
  return (
    <View style={vertical ? s.railV : s.railH}>
      {KEYS.map((key) => {
        const active = key === reaction;
        const dimmed = voted && !active;
        const col = REACTION_COLORS[key];
        return (
          <MotiView
            key={key}
            animate={{ opacity: dimmed ? 0.5 : 1, scale: 1 }}
            transition={SPRING}
            style={s.item}
          >
            {voted ? (
              <PctCircle
                color={active ? col : stroke}
                borderColor={active ? col : stroke}
                value={reactions[key]}
                light={light}
              />
            ) : (
              <>
                <Pressable
                  onPress={() => onReact(key)}
                  accessibilityLabel={LABELS[key]}
                  style={[s.btn, s.btnLg, { borderColor: stroke }]}
                >
                  <IIcon name={key} size={26} color={stroke} strokeWidth={2} />
                </Pressable>
                <Text
                  style={[
                    s.label,
                    light && s.shadow,
                    { color: stroke, opacity: light ? 0.8 : 0.6 },
                  ]}
                >
                  {LABELS[key]}
                </Text>
              </>
            )}
          </MotiView>
        );
      })}
    </View>
  );
}

// ── V2: Gevulde gekleurde smileys (inline SVG) ──────────────────────────────

function FilledSmiley({ type, size, color }) {
  const cx = 20;
  const cy = 20;
  const mouth = {
    smile: `M${cx - 6} ${cy + 4}c1.5 2.5 3.5 3.5 6 3.5s4.5-1 6-3.5`,
    meh: `M${cx - 6} ${cy + 4}h12`,
    frown: `M${cx - 6} ${cy + 8}c1.5-2.5 3.5-3.5 6-3.5s4.5 1 6 3.5`,
  }[type];
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Circle cx={cx} cy={cy} r={20} fill={color} />
      <Circle cx={cx - 5} cy={cy - 4} r={2.4} fill="white" />
      <Circle cx={cx + 5} cy={cy - 4} r={2.4} fill="white" />
      <Path d={mouth} stroke="white" strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}

export function ReactionFilled({
  reaction,
  onReact,
  reactions,
  vertical = false,
  light = false,
}) {
  const voted = reaction != null;
  const stroke = light ? colors.cream : colors.ink;
  return (
    <View style={vertical ? s.railV : s.railH}>
      {KEYS.map((key) => {
        const active = key === reaction;
        const dimmed = voted && !active;
        const col = REACTION_COLORS[key];
        return (
          <MotiView
            key={key}
            animate={{ opacity: dimmed ? 0.5 : 1, scale: 1 }}
            transition={SPRING}
            style={s.item}
          >
            {voted ? (
              <PctCircle
                color={active ? col : stroke}
                borderColor={active ? col : col + "55"}
                value={reactions[key]}
                light={light}
              />
            ) : (
              <>
                <Pressable
                  onPress={() => onReact(key)}
                  accessibilityLabel={LABELS[key]}
                  style={s.emojiBtn}
                >
                  <FilledSmiley type={key} size={44} color={col + "99"} />
                </Pressable>
                <Text
                  style={[
                    s.label,
                    light && s.shadow,
                    { color: stroke, opacity: light ? 0.8 : 0.6 },
                  ]}
                >
                  {LABELS[key]}
                </Text>
              </>
            )}
          </MotiView>
        );
      })}
    </View>
  );
}

// ── V3: Native emoji benchmark ──────────────────────────────────────────────

const EMOJI = { smile: "😊", meh: "😐", frown: "☹️" };

export function ReactionEmoji({
  reaction,
  onReact,
  reactions,
  vertical = false,
  light = false,
}) {
  const voted = reaction != null;
  const stroke = light ? colors.cream : colors.ink;
  const idleBorder = light ? colors.cream + "55" : "transparent";
  return (
    <View style={vertical ? s.railV : s.railH}>
      {KEYS.map((key) => {
        const active = key === reaction;
        const dimmed = voted && !active;
        const col = REACTION_COLORS[key];
        return (
          <MotiView
            key={key}
            animate={{ opacity: dimmed ? 0.5 : 1, scale: 1 }}
            transition={SPRING}
            style={s.item}
          >
            {voted ? (
              <PctCircle
                color={active ? col : stroke}
                borderColor={active ? col : idleBorder}
                value={reactions[key]}
                light={light}
              />
            ) : (
              <Pressable
                onPress={() => onReact(key)}
                accessibilityLabel={LABELS[key]}
                style={[s.btn, s.btnLg, { borderColor: idleBorder }]}
              >
                <Text style={{ fontSize: 26 }}>{EMOJI[key]}</Text>
              </Pressable>
            )}
          </MotiView>
        );
      })}
    </View>
  );
}

// ── V4: Mening-framing (eens / twijfel / oneens) ───────────────────────────

function StanceIcon({ type, size, color }) {
  if (type === "smile") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M7 22V11M2 13v7a2 2 0 002 2h12.3a2 2 0 001.97-1.67l1.3-7A2 2 0 0017.6 11H14V5a3 3 0 00-3-3 1 1 0 00-1 1v.5L7.5 9a1 1 0 01-.5.87V22"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (type === "meh") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 9a3 3 0 115.77 1c-.34.88-1.27 1.5-1.77 2.5V14"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Circle cx="12" cy="18" r="1.2" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 2v11M22 11V4a2 2 0 00-2-2H7.7a2 2 0 00-1.97 1.67l-1.3 7A2 2 0 006.4 13H10v6a3 3 0 003 3 1 1 0 001-1v-.5l2.5-5.5a1 1 0 01.5-.87V2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ReactionStance({
  reaction,
  onReact,
  reactions,
  vertical = false,
  light = false,
}) {
  const voted = reaction != null;
  const stroke = light ? colors.cream : colors.ink;
  return (
    <View style={vertical ? s.railV : s.railH}>
      {KEYS.map((key) => {
        const active = key === reaction;
        const dimmed = voted && !active;
        const col = REACTION_COLORS[key];
        return (
          <MotiView
            key={key}
            animate={{ opacity: dimmed ? 0.5 : 1, scale: 1 }}
            transition={SPRING}
            style={s.item}
          >
            {voted ? (
              <PctCircle
                color={active ? col : stroke}
                borderColor={active ? col : stroke}
                value={reactions[key]}
                light={light}
              />
            ) : (
              <>
                <Pressable
                  onPress={() => onReact(key)}
                  accessibilityLabel={STANCE[key]}
                  style={[s.btn, s.btnLg, { borderColor: stroke }]}
                >
                  <StanceIcon type={key} size={22} color={stroke} />
                </Pressable>
                <Text
                  style={[
                    s.label,
                    light && s.shadow,
                    { color: stroke, opacity: light ? 0.8 : 0.6 },
                  ]}
                >
                  {STANCE[key]}
                </Text>
              </>
            )}
          </MotiView>
        );
      })}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  railH: { flexDirection: "row", alignItems: "flex-start", gap: 20 },
  railV: { flexDirection: "column", alignItems: "center", gap: 10 },
  item: { alignItems: "center" },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  btnLg: { width: 52, height: 52, borderRadius: 26 },
  emojiBtn: { alignItems: "center", justifyContent: "center" },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
  },
  shadow: {
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  pctCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  pctNum: {
    fontFamily: fonts.display,
    fontWeight: "700",
    fontSize: 15,
  },
});
