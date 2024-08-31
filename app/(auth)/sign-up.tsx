import React, { useEffect, useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Typing: React.FC = () => {
  const animation1 = useRef(new Animated.Value(0)).current;
  const animation2 = useRef(new Animated.Value(0)).current;
  const animation3 = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

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
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      className={`flex-1 justify-center p-8 ${isTablet ? 'px-16' : ''}`}>
      <View className="rounded-3xl bg-white bg-opacity-90 p-8 shadow-lg">
        <View className="flex-row items-center justify-center">
          <AnimatedView
            className="mx-1 h-3 w-3 rounded-full bg-indigo-600 opacity-90"
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
            className="mx-1 h-3 w-3 rounded-full bg-indigo-600 opacity-90"
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
            className="mx-1 h-3 w-3 rounded-full bg-indigo-600 opacity-90"
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
      </View>
    </LinearGradient>
  );
};

export default Typing;
