import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradient } from "@/src/lib/theme";

const BAR_PATTERN = [0.35, 0.65, 0.45, 0.85, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.55, 0.8, 0.35, 0.7, 0.45];

function Bar({ peak, active, delay }: { peak: number; active: boolean; delay: number }) {
  const progress = useSharedValue(active ? 1 : 0.3);

  useEffect(() => {
    if (active) {
      progress.value = withDelay(
        delay,
        withRepeat(
          withTiming(1, { duration: 520 + (delay % 240), easing: Easing.inOut(Easing.quad) }),
          -1,
          true,
        ),
      );
    } else {
      progress.value = withTiming(0.25, { duration: 200 });
    }
  }, [active, delay, progress]);

  const style = useAnimatedStyle(() => ({
    height: 6 + progress.value * peak * 56,
  }));

  return (
    <Animated.View style={[styles.barWrap, style]}>
      {active ? (
        <LinearGradient
          colors={[gradient.primary[0], gradient.primary[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.borderStrong }]} />
      )}
    </Animated.View>
  );
}

export function Waveform({ active, bars = 32 }: { active: boolean; bars?: number }) {
  const seq = Array.from({ length: bars }, (_, i) => BAR_PATTERN[i % BAR_PATTERN.length]);
  return (
    <View style={styles.row} testID="voice-waveform">
      {seq.map((peak, i) => (
        <Bar key={i} peak={peak} active={active} delay={(i * 53) % 600} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 70,
  },
  barWrap: {
    width: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
});
