import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export default function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: Props) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#f5f5f5'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, backgroundColor },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    marginVertical: 6,
  },
}); 