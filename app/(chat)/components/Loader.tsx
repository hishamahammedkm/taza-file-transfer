import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { classNames } from '../lib';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const Loader = () => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    return {
      rotation: rotation.value,
    };
  });

  return (
    <View className="bg-taza-light/80 absolute inset-0 flex flex-1 items-center justify-center">
      <View accessible={true} accessibilityLabel="Loading..." accessibilityRole="progressbar">
        <AnimatedSvg width={64} height={64} viewBox="3 3 18 18" animatedProps={animatedProps}>
          <Path
            fill="#FFA500" // Assuming taza-orange is close to this color
            d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5ZM3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
          />
          <Path
            fill="#FF0000" // Assuming taza-red is close to this color
            d="M16.9497 7.05015C14.2161 4.31648 9.78392 4.31648 7.05025 7.05015C6.65973 7.44067 6.02656 7.44067 5.63604 7.05015C5.24551 6.65962 5.24551 6.02646 5.63604 5.63593C9.15076 2.12121 14.8492 2.12121 18.364 5.63593C18.7545 6.02646 18.7545 6.65962 18.364 7.05015C17.9734 7.44067 17.3403 7.44067 16.9497 7.05015Z"
          />
        </AnimatedSvg>
      </View>
    </View>
  );
};

export default Loader;
