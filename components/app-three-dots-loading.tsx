import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';

const dotSize = 8;
const spacing = 10;
const animationDuration = 800;
const dotColor = 'white';

interface AppThreeDotsLoadingProps {
  style?: StyleProp<ViewStyle>;
}

const AppThreeDotsLoading: React.FC<AppThreeDotsLoadingProps> = ({ style }) => {
  const animatedValues = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const createDotAnimation = (animatedValue: Animated.Value) => {
      return Animated.sequence([
        // Phase 1: Scale up
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
        // Phase 2: Scale down
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
      ]);
    };

    // Stagger the animations slightly to create the wave effect
    const staggerSequence = Animated.stagger(animationDuration / 3, [
      createDotAnimation(animatedValues[0]),
      createDotAnimation(animatedValues[1]),
      createDotAnimation(animatedValues[2]),
    ]);

    const startAnimation = () => {
      Animated.loop(staggerSequence).start();
    };

    startAnimation();

    // Clean up the animation on unmount
    return () => {
      animatedValues.forEach(value => value.stopAnimation());
    };
  }, []);

  const dotInterpolations = animatedValues.map(value =>
    value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1], // Scale between 0.5 (small) and 1 (normal size)
    })
  );

  return (
    <View style={[styles.container, style]}>
      {dotInterpolations.map((scale, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            { transform: [{ scale }] },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: dotSize + 5,
    marginTop: 20,
  },
  dot: {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: dotColor,
    marginHorizontal: spacing / 2,
  },
});

export default AppThreeDotsLoading;