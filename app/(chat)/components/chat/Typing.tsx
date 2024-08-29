import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Animated } from 'react-native';

const Typing: React.FC = () => {
  const animation1 = useRef(new Animated.Value(0)).current;
  const animation2 = useRef(new Animated.Value(0)).current;
  const animation3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (animation: Animated.Value) => {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const interval = setInterval(() => {
      animateDot(animation1);
      setTimeout(() => animateDot(animation2), 150);
      setTimeout(() => animateDot(animation3), 300);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const AnimatedView = Animated.createAnimatedComponent(View);

  return (
    <View className="bg-taza-light flex-row rounded-3xl p-5">
      <AnimatedView
        className="bg-taza-red mx-[0.5px] h-2 w-2 rounded-full"
        style={{
          transform: [
            {
              scale: animation1.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.5],
              }),
            },
          ],
        }}
      />
      <AnimatedView
        className="bg-taza-orange mx-[0.5px] h-2 w-2 rounded-full"
        style={{
          transform: [
            {
              scale: animation2.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.5],
              }),
            },
          ],
        }}
      />
      <AnimatedView
        className="bg-taza-red mx-[0.5px] h-2 w-2 rounded-full"
        style={{
          transform: [
            {
              scale: animation3.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.5],
              }),
            },
          ],
        }}
      />
    </View>
  );
};

export default Typing;
