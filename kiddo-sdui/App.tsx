import React, { useState, useMemo } from "react";
import { SafeAreaView, View, StyleSheet, Text, Platform, StatusBar } from "react-native";
import { HomepageRenderer } from "./src/engine/HomepageRenderer";
import { CampaignSwitcher } from "./src/components/CampaignSwitcher";
import { CartBadge } from "./src/components/CartBadge";
import { FullScreenOverlay } from "./src/blocks/FullScreenOverlay";
import { ThemeContext } from "./src/state/ThemeContext";
import { CampaignConfig, HomepagePayload } from "./src/types/blocks";

// Imports
import mockPayload from "./src/mock/homepage.mock.json";
import campaignsList from "./src/campaigns/campaigns.json";

export default function App() {
  const campaigns = campaignsList as CampaignConfig[];
  const [activeCampaignId, setActiveCampaignId] = useState<CampaignConfig["id"]>("back_to_school");

  // Lookup active campaign
  const activeCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];
  }, [campaigns, activeCampaignId]);

  // Merge default payload structures with the selected campaign configuration elements
  const currentPayload = useMemo<HomepagePayload>(() => {
    const defaultBlocks = mockPayload.blocks;
    const extraBlocks = activeCampaign.extraBlocks || [];
    
    return {
      theme: activeCampaign.theme,
      activeCampaignId: activeCampaign.id,
      blocks: [...defaultBlocks, ...extraBlocks],
    };
  }, [activeCampaign]);

  return (
    <ThemeContext.Provider value={currentPayload.theme}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentPayload.theme.background }]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={currentPayload.theme.background}
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
          <HomepageRenderer blocks={currentPayload.blocks} />
        </View>

        {/* Global Campaign Lottie overlay */}
        <FullScreenOverlay block={activeCampaign.overlay} />

        {/* Dev Mode Switches */}
        <CampaignSwitcher
          campaigns={campaigns}
          activeId={activeCampaignId}
          onSelectCampaign={(id) => setActiveCampaignId(id)}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  logo: {
    fontSize: 22,
    fontWeight: "900",
    color: "#222",
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
