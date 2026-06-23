import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import LottieView from "lottie-react-native";
import { FullScreenOverlayBlock } from "../types/blocks";
import * as FileSystem from "expo-file-system/legacy";

interface FullScreenOverlayProps {
  block?: FullScreenOverlayBlock;
}

export const FullScreenOverlay: React.FC<FullScreenOverlayProps> = ({ block }) => {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!block || !block.lottieUrl) {
      setCachedUrl(null);
      return;
    }

    const downloadAndCache = async () => {
      try {
        const filename = block.lottieUrl.split('/').pop() || "animation.json";
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        if (fileInfo.exists) {
          console.log("[LottieCache] Loaded from cache:", fileUri);
          setCachedUrl(fileUri);
        } else {
          console.log("[LottieCache] Downloading:", block.lottieUrl);
          const downloadResult = await FileSystem.downloadAsync(block.lottieUrl, fileUri);
          setCachedUrl(downloadResult.uri);
        }
      } catch (err) {
        console.warn("[LottieCache] Failed to cache asset. Falling back to remote url.", err);
        setCachedUrl(block.lottieUrl); // fallback
      }
    };

    downloadAndCache();
  }, [block?.lottieUrl]);

  if (!block || !block.lottieUrl || !cachedUrl) return null;

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      <LottieView
        source={{ uri: cachedUrl }}
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
