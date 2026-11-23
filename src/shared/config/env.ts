function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing ${name}: add it to .env and restart Metro.`);
  return value;
}

// Each variable must be read as a literal `process.env.EXPO_PUBLIC_*`: Expo inlines only that exact form.
export const env = {
  apiBaseUrl: required('EXPO_PUBLIC_API_BASE_URL', process.env.EXPO_PUBLIC_API_BASE_URL),
};
