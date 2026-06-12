import { Stack } from 'expo-router';
import { ServerProvider } from '../components/server-context.js';

export default function RootLayout() {
    return (
        <ServerProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
            </Stack>
        </ServerProvider>
    );
}