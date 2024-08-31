import React, { useEffect, useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Typing: React.FC = () => {
  const animations = [0, 1, 2].map(() => useRef(new Animated.Value(0)).current);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const animateDot = (animation: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animations.forEach((animation, index) => animateDot(animation, index * 150));

    return () => animations.forEach((animation) => animation.stopAnimation());
  }, []);

  const AnimatedDot = ({ animation }: { animation: Animated.Value }) => (
    <Animated.View
      className="mx-1 h-2 w-2 rounded-full bg-indigo-600 opacity-90"
      style={{
        transform: [
          {
            scale: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.3],
            }),
          },
        ],
      }}
    />
  );

  return (
    <View className="flex-row items-center justify-center">
      {animations.map((animation, index) => (
        <AnimatedDot key={index} animation={animation} />
      ))}
    </View>
  );
};

export default Typing;
