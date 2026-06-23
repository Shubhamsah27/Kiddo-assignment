import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { BannerHeroBlock } from "../types/blocks";
import { handleAction } from "../engine/actionDispatcher";
import { useTheme } from "../state/ThemeContext";
import { BrandTokens } from "../tokens/brandTokens";

interface BannerHeroProps {
  block: BannerHeroBlock;
}

export const BannerHero: React.FC<BannerHeroProps> = ({ block }) => {
  const theme = useTheme();

  const handlePress = () => {
    if (block.ctaAction) {
      handleAction({
        type: block.ctaAction.type as import("../types/actions").Action["type"],
        payload: block.ctaAction.payload,
      } as import("../types/actions").Action);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.primary + "12" }]}>
        
        {/* Signature concentric rainbow SVG backdrop behind text */}
        <View style={styles.svgBackdrop}>
          <Svg height="150" width="150" viewBox="0 0 100 100">
            {/* Coral concentric arc */}
            <Circle cx="50" cy="50" r="45" stroke="#FF6B6B" strokeWidth="4" fill="none" opacity="0.2" />
            {/* Sun concentric arc */}
            <Circle cx="50" cy="50" r="35" stroke="#FFE66D" strokeWidth="4" fill="none" opacity="0.2" />
            {/* Sky concentric arc */}
            <Circle cx="50" cy="50" r="25" stroke="#4ECDC4" strokeWidth="4" fill="none" opacity="0.2" />
          </Svg>
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.headline, { color: theme.primary }]}>
            {block.headline}
          </Text>
          {block.subline && <Text style={[styles.subline, { color: theme.textMuted }]}>{block.subline}</Text>}
          
          <TouchableOpacity
            onPress={handlePress}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.buttonText, { color: theme.surface }]}>{block.ctaLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: BrandTokens.space3,
    paddingVertical: BrandTokens.space2,
  },
  card: {
    borderRadius: BrandTokens.radiusMd,
    padding: BrandTokens.space3,
    overflow: "hidden",
    position: "relative",
    minHeight: 140,
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  svgBackdrop: {
    position: "absolute",
    right: -20,
    top: -20,
    opacity: 0.7,
  },
  textContainer: {
    zIndex: 2,
    maxWidth: "75%",
  },
  headline: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: BrandTokens.fontDisplay,
    lineHeight: 28,
  },
  subline: {
    fontSize: 13,
    fontFamily: BrandTokens.fontBody,
    marginTop: BrandTokens.space1,
    marginBottom: BrandTokens.space2,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: BrandTokens.space3,
    paddingVertical: BrandTokens.space2 - 2,
    borderRadius: BrandTokens.radiusPill,
    marginTop: BrandTokens.space2,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: BrandTokens.fontBody,
  },
});
export default BannerHero;
