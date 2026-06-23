import React from "react";
import Animated, { FadeInUp } from "react-native-reanimated";

interface StaggeredViewProps {
  index: number;
  children: React.ReactNode;
}

export const StaggeredView: React.FC<StaggeredViewProps> = ({ index, children }) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 40)
        .duration(400)
        .springify()}
    >
      {children}
    </Animated.View>
  );
};
export default StaggeredView;
