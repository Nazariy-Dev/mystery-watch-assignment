import { Image } from 'react-native';

const COIN = require('../../../assets/icons/coin.png');

type CoinIconProps = {
  size?: number;
};

export function CoinIcon({ size = 18 }: CoinIconProps) {
  return <Image source={COIN} style={{ width: size, height: size }} />;
}
