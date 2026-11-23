import { Canvas, useFrame } from '@react-three/fiber/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Suspense, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import type { Group } from 'three';

import { BoxLighting, BoxModel, useGetBoxQuery } from '@/entities/box';
import type { RootStackParamList } from '@/shared/config';
import { Button, IconButton, Screen, Text } from '@/shared/ui';

type BoxDetailsPageProps = NativeStackScreenProps<RootStackParamList, 'BoxDetails'>;

function Spin({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.6;
  });
  return <group ref={group}>{children}</group>;
}

export function BoxDetailsPage({ navigation, route }: BoxDetailsPageProps) {
  const { boxId } = route.params;
  const { data: box } = useGetBoxQuery(boxId);
  const [open, setOpen] = useState(false);

  return (
    <Screen>
      <IconButton icon="chevron-back" accessibilityLabel="Back" onPress={navigation.goBack} />
      <View style={styles.stage}>
        {box && (
          <Canvas camera={{ position: [0, 1.6, 3.6], fov: 32 }} onCreated={({ camera }) => camera.lookAt(0, 0.7, 0)}>
            <BoxLighting tier={box.tier} />
            <Suspense fallback={null}>
              <Spin>
                <BoxModel tier={box.tier} openness={open ? 1 : 0} />
              </Spin>
            </Suspense>
          </Canvas>
        )}
      </View>
      <View style={styles.content}>
        <Text variant="label" tone="primary">{box?.tier ?? 'Box details'}</Text>
        <Text variant="display">{box?.name ?? boxId}</Text>
        <Button label={open ? 'Close lid' : 'Open lid'} variant="secondary" onPress={() => setOpen(!open)} />
        <Button label="Open box" onPress={() => navigation.navigate('BoxOpening', { boxId })} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  stage: {
    height: 360,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.gap(4),
  },
}));
