import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { BannerHeroBlock } from "../types/blocks";
import { handleAction } from "../engine/actionDispatcher";
import { useTheme } from "../state/ThemeContext";

interface BannerHeroProps {
  block: BannerHeroBlock;
}

export const BannerHero: React.FC<BannerHeroProps> = ({ block }) => {
  const theme = useTheme();

  const handlePress = () => {
    if (block.action) {
      handleAction(block.action);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        disabled={!block.action}
        style={[styles.wrapper, { borderColor: theme.primary + "20" }]}
      >
        <Image
          source={{ uri: block.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  wrapper: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: "#eee",
  },
});
