import React, { useState, useMemo } from "react";
import { SafeAreaView, View, StyleSheet, Text, Platform, StatusBar } from "react-native";
import { HomepageRenderer } from "./src/engine/HomepageRenderer";
import { CampaignSwitcher } from "./src/components/CampaignSwitcher";
import { CartBadge } from "./src/components/CartBadge";
import { FullScreenOverlay } from "./src/blocks/FullScreenOverlay";
import { ThemeContext } from "./src/state/ThemeContext";
import { CampaignConfig, HomepagePayload, Block } from "./src/types/blocks";
import { BrandTokens } from "./src/tokens/brandTokens";

// Imports
import mockPayload from "./src/mock/homepage.mock.json";
import { CAMPAIGN_CONFIGS } from "./src/campaigns/campaigns";

export default function App() {
  const campaigns = Object.values(CAMPAIGN_CONFIGS);
  const [activeCampaignId, setActiveCampaignId] = useState<CampaignConfig["id"]>("back_to_school");

  // Lookup active campaign
  const activeCampaign = useMemo(() => {
    return CAMPAIGN_CONFIGS[activeCampaignId] || CAMPAIGN_CONFIGS.back_to_school;
  }, [activeCampaignId]);

  // Merge default payload structures with the selected campaign configuration elements
  const currentPayload = useMemo<HomepagePayload & { blockOverrides?: Record<string, any> }>(() => {
    const defaultBlocks = mockPayload.blocks as Block[];
    const extraBlocks = activeCampaign.extraBlocks || [];
    
    return {
      campaignId: activeCampaign.id,
      blocks: [...defaultBlocks, ...extraBlocks],
      blockOverrides: activeCampaign.blockOverrides,
    };
  }, [activeCampaign]);

  return (
    <ThemeContext.Provider value={activeCampaign.theme}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: activeCampaign.theme.background }]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={activeCampaign.theme.background}
        />
        
        {/* Main Application Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Kiddo</Text>
            <Text style={styles.subLogo}>Superfast Parenting Shop</Text>
          </View>
          <CartBadge />
        </View>

        {/* Dynamic SDUI Main Feed Render Frame */}
        <View style={styles.feedContainer}>
          <HomepageRenderer
            blocks={currentPayload.blocks}
            blockOverrides={currentPayload.blockOverrides}
          />
        </View>

        {/* Global Campaign Lottie overlay */}
        <FullScreenOverlay block={activeCampaign.overlay} />

        {/* Dev Mode Switches */}
        <CampaignSwitcher
          campaigns={campaigns as any}
          activeId={activeCampaignId}
          onSelectCampaign={(id) => setActiveCampaignId(id as any)}
        />
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: BrandTokens.space3,
    paddingVertical: BrandTokens.space2 + 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  logo: {
    fontSize: 22,
    fontWeight: "900",
    color: BrandTokens.coral,
    letterSpacing: -0.5,
  },
  subLogo: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  feedContainer: {
    flex: 1,
  },
});
