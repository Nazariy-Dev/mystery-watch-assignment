import { Image, type ImageStyle, type StyleProp } from 'react-native';

import type { Watch } from '@/shared/api';

const IMAGES: Record<string, number> = {
  casio: require('../../../../assets/watches/casio.png'),
  perpetual: require('../../../../assets/watches/perpetual.png'),
  gmt: require('../../../../assets/watches/gmt.png'),
  'sky-dweller': require('../../../../assets/watches/sky-dweller.png'),
};

type WatchImageProps = {
  watch: Watch;
  style?: StyleProp<ImageStyle>;
};

export function WatchImage({ watch, style }: WatchImageProps) {
  return (
    <Image
      source={IMAGES[watch.id]}
      style={[{ aspectRatio: 1019 / 1544 }, style]}
      resizeMode="contain"
      accessibilityLabel={`${watch.brand} ${watch.name}`}
    />
  );
}
