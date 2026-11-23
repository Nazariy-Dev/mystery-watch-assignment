import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { mockFetch } from '@/shared/api/mock-backend';
import { API_BASE_URL } from '@/shared/config';

/** Temporary root: proves the in-app mock backend returns real Response objects on device. */
export default function App() {
  const [status, setStatus] = useState('Checking mock backend…');

  useEffect(() => {
    mockFetch(new Request(`${API_BASE_URL}/health`))
      .then((res) => res.json())
      .then((body: { ok: boolean }) => setStatus(`Mock backend ok: ${body.ok}`))
      .catch((error: unknown) => setStatus(`Mock backend failed: ${String(error)}`));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{status}</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#F2F3FF',
  },
});
