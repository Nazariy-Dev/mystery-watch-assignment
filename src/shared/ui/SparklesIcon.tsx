import { Image, type ImageStyle, type StyleProp } from 'react-native';

const SPARKLES = require('../../../assets/icons/sparkles.png');

export function SparklesIcon({ size = 24, style }: { size?: number; style?: StyleProp<ImageStyle> }) {
  return <Image source={SPARKLES} style={[{ width: size, height: size }, style]} />;
}
