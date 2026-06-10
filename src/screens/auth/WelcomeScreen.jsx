import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  useWindowDimensions,
  Animated,
  Easing,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

import { IIcon } from "../../components/Icons";
import { Btn } from "../../components/Btn";
import { ImpaktLogo } from "../../components/ImpaktLogo";
import { colors, fonts } from "../../theme/tokens";
import { fadeUp } from "../../theme/animations";

const slides = [
  require("../../../assets/Impakt_Feed.jpg"),
  require("../../../assets/Impakt_Happy_Feed.jpg"),
  require("../../../assets/Impakt_Humor.jpg"),
];

export function WelcomeScreen({ onLogin, onRegister, onSkip }) {
  const insets = useSafeAreaInsets();

  const [slideIndex, setSlideIndex] = useState(0);
  const [nextSlideIndex, setNextSlideIndex] = useState(null);

  const slideAnim = useMemo(() => new Animated.Value(0), []);
  const isSliding = useRef(false);

  const { width, height } = useWindowDimensions();

  const isSmallScreen = height < 760;

  const phoneWidth = Math.min(width * 0.58, isSmallScreen ? 190 : 215);
  const phoneHeight = phoneWidth * 2;

  const logoWidth = Math.min(width * 0.58, 230);
  const logoHeight = logoWidth * 0.32;

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      if (isSliding.current) return;

      isSliding.current = true;

      const newIndex = slideIndex === slides.length - 1 ? 0 : slideIndex + 1;

      setNextSlideIndex(newIndex);
      slideAnim.setValue(0);

      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setSlideIndex(newIndex);
          setNextSlideIndex(null);
          slideAnim.setValue(0);
        }

        isSliding.current = false;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [slideIndex, slideAnim]);

  const currentSlideTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -phoneWidth],
  });

  const nextSlideTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [phoneWidth, 0],
  });

  const activeDotIndex = nextSlideIndex ?? slideIndex;

  return (
    <LinearGradient
      colors={["#F2EEE8", "#EFEBE6", "#E6E0D6"]}
      style={styles.screen}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            minHeight: height,
            paddingTop: insets.top + (isSmallScreen ? 18 : 28),
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <MotiView {...fadeUp} delay={80} style={styles.logo}>
            <ImpaktLogo
              style={[
                styles.logoImage,
                {
                  width: logoWidth,
                  height: logoHeight,
                },
              ]}
            />
          </MotiView>

          <MotiView {...fadeUp} delay={160}>
            <Text style={styles.tagline}>Het nieuws beter verpakt</Text>
          </MotiView>

          <MotiView {...fadeUp} delay={200} style={styles.heroDivider} />
        </View>

        <MotiView {...fadeUp} delay={240} style={styles.phoneWrapper}>
          <View
            style={[
              styles.phoneFrame,
              {
                width: phoneWidth,
                height: phoneHeight,
                borderRadius: phoneWidth * 0.18,
                padding: phoneWidth * 0.025,
              },
            ]}
          >
            <View
              style={[
                styles.phoneScreen,
                {
                  borderRadius: phoneWidth * 0.15,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.slideLayer,
                  {
                    transform: [{ translateX: currentSlideTranslateX }],
                  },
                ]}
              >
                <Image
                  source={slides[slideIndex]}
                  style={styles.slideImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {nextSlideIndex !== null && (
                <Animated.View
                  style={[
                    styles.slideLayer,
                    {
                      transform: [{ translateX: nextSlideTranslateX }],
                    },
                  ]}
                >
                  <Image
                    source={slides[nextSlideIndex]}
                    style={styles.slideImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              )}
            </View>

            <View style={styles.slideDots}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.slideDot,
                    index === activeDotIndex && styles.slideDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </MotiView>

        <MotiView {...fadeUp} delay={320} style={styles.ctaStack}>
          <Btn variant="impaktRed" onPress={onRegister} iconRight="arrow">
            Account maken
          </Btn>

          <Btn variant="cream" onPress={onLogin}>
            Inloggen
          </Btn>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>of</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.skipLabel}>Verder zonder account </Text>
            <IIcon
              name="arrow"
              size={14}
              strokeWidth={2.2}
              color={colors.ink}
            />
          </Pressable>
        </MotiView>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
    gap: 18,
  },

  heroSection: {
    alignItems: "center",
  },

  logo: {
    alignItems: "center",
    marginBottom: 6,
  },

  logoImage: {
    width: 230,
    height: 74,
  },

  tagline: {
    fontFamily: fonts.body,
    fontSize: 20,
    lineHeight: 19,
    color: "rgba(15,17,26,0.62)",
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 240,
    marginTop: 10,
    letterSpacing: 0.2,
  },

  phoneWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },

  phoneFrame: {
    backgroundColor: colors.ink,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    overflow: "hidden",
  },

  phoneScreen: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#F2EEE8",
  },

  slideImage: {
    width: "100%",
    height: "100%",
  },

  slideDots: {
    position: "absolute",
    bottom: 18,
    alignSelf: "center",
    flexDirection: "row",
    gap: 7,
    zIndex: 10,
  },

  slideDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.45)",
  },

  slideDotActive: {
    width: 18,
    backgroundColor: "#fff",
  },

  ctaStack: {
    width: "88%",
    maxWidth: 335,
    alignSelf: "center",
    gap: 12,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(15,17,26,0.18)",
  },

  dividerLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "rgba(15,17,26,0.55)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },

  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  skipLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    textDecorationLine: "underline",
  },

  slideLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  heroDivider: {
    width: "82%",
    maxWidth: 294,
    height: 1,
    backgroundColor: "rgba(15,17,26,0.18)",
    marginTop: 18,
  },
});
