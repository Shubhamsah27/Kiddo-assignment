import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  children: ReactNode;
  blockType: string;
  blockId: string;
}

interface State {
  hasError: boolean;
}

export class BlockErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[BlockErrorBoundary] Crash in block "${this.props.blockType}" (ID: ${this.props.blockId}):`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (__DEV__) {
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              ⚠️ Block "{this.props.blockType}" crashed during render (Dev mode warning).
            </Text>
          </View>
        );
      }
      return null; // Omit crashed blocks completely in production
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 10,
    backgroundColor: "#FFEBEB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFC1C1",
  },
  errorText: {
    color: "#D8000C",
    fontSize: 11,
    fontWeight: "600",
  },
});
