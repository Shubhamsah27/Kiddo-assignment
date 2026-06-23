import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { CampaignConfig } from "../types/blocks";
import { useTheme } from "../state/ThemeContext";

interface CampaignSwitcherProps {
  campaigns: CampaignConfig[];
  activeId: string;
  onSelectCampaign: (id: CampaignConfig["id"]) => void;
}

export const CampaignSwitcher: React.FC<CampaignSwitcherProps> = ({
  campaigns,
  activeId,
  onSelectCampaign,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.outerContainer}>
      <Text style={styles.sectionHeader}>Campaign Control Panel (Dev Mode)</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {campaigns.map((camp) => {
          const isActive = camp.id === activeId;
          return (
            <TouchableOpacity
              key={camp.id}
              onPress={() => onSelectCampaign(camp.id)}
              style={[
                styles.button,
                {
                  backgroundColor: isActive ? theme.primary : "#f5f5f5",
                  borderColor: isActive ? theme.primary : "#ddd",
                },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: isActive ? "#fff" : "#444",
                    fontWeight: isActive ? "700" : "500",
                  },
                ]}
              >
                {camp.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 4,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 12,
  },
});
export default CampaignSwitcher;
