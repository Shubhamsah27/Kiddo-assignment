import React from "react";
import { StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";
import { FullScreenOverlayBlock } from "../types/blocks";

interface FullScreenOverlayProps {
  block?: FullScreenOverlayBlock;
}

export const FullScreenOverlay: React.FC<FullScreenOverlayProps> = ({ block }) => {
  if (!block || !block.lottieUrl) return null;

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      <LottieView
        source={{ uri: block.lottieUrl }}
        style={styles.animation}
        autoPlay
        loop
        resizeMode="cover"
        cacheComposition={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
  },
  animation: {
    flex: 1,
  },
});
export default FullScreenOverlay;
