import { Canvas, useFrame } from '@react-three/fiber/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Suspense, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';
import type { Group } from 'three';

import { BoxLighting, BoxModel, useGetBoxQuery } from '@/entities/box';
import type { RootStackParamList } from '@/shared/config';
import { Button, IconButton, Screen, Text } from '@/shared/ui';

type BoxDetailsPageProps = NativeStackScreenProps<RootStackParamList, 'BoxDetails'>;

const Spinner = withUnistyles(ActivityIndicator, (theme) => ({ color: theme.colors.primary }));

function Spin({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.6;
  });
  return <group ref={group}>{children}</group>;
}

export function BoxDetailsPage({ navigation, route }: BoxDetailsPageProps) {
  const { boxId } = route.params;
  const { data: box, isError, refetch } = useGetBoxQuery(boxId);
  const [open, setOpen] = useState(false);

  return (
    <Screen>
      <IconButton icon="chevron-back" accessibilityLabel="Back" onPress={navigation.goBack} />
      {/* Branch on data, not isLoading: a background refetch must not swap the loaded page for a spinner. */}
      {box ? (
        <>
          <View style={styles.stage}>
            <Canvas camera={{ position: [0, 1.6, 3.6], fov: 32 }} onCreated={({ camera }) => camera.lookAt(0, 0.7, 0)}>
              <BoxLighting tier={box.tier} />
              <Suspense fallback={null}>
                <Spin>
                  <BoxModel tier={box.tier} openness={open ? 1 : 0} />
                </Spin>
              </Suspense>
            </Canvas>
          </View>
          <View style={styles.content}>
            <Text variant="label" tone="primary">{box.tier}</Text>
            <Text variant="display">{box.name}</Text>
            <Button label={open ? 'Close lid' : 'Open lid'} variant="secondary" onPress={() => setOpen(!open)} />
            <Button label="Open box" onPress={() => navigation.navigate('BoxOpening', { boxId })} />
          </View>
        </>
      ) : (
        <View style={styles.status}>
          {isError ? (
            <>
              <Text tone="muted">Couldn&apos;t load this box.</Text>
              <Button label="Retry" variant="secondary" onPress={refetch} />
            </>
          ) : (
            <Spinner size="large" accessibilityLabel="Loading box" />
          )}
        </View>
      )}
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
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(4),
  },
}));
