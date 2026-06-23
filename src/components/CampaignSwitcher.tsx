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
    <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.textMuted + "40" }]}>
      <Text style={[styles.label, { color: theme.textMuted }]}>Campaign Control Panel (Dev Mode)</Text>
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
                  backgroundColor: isActive ? theme.primary : theme.background,
                  borderColor: isActive ? theme.primary : theme.textMuted + "40",
                },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: isActive ? theme.surface : theme.text,
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
  container: {
    padding: 16,
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
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
