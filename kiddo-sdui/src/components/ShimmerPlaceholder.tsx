import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "../state/ThemeContext";

const { width } = Dimensions.get("window");

export const ShimmerPlaceholder: React.FC<{ style?: any }> = ({ style }) => {
  const theme = useTheme();
  const shimmerValue = useSharedValue(-1);

  useEffect(() => {
    shimmerValue.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerValue.value, [-1, 1], [-width, width]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.shimmerContainer, style, { backgroundColor: theme.primary + "10" }]}>
      <Animated.View
        style={[
          styles.shimmerLine,
          animatedStyle,
          {
            backgroundColor: "rgba(255, 255, 255, 0.4)",
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  shimmerContainer: {
    overflow: "hidden",
    position: "relative",
  },
  shimmerLine: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
});
export default ShimmerPlaceholder;
