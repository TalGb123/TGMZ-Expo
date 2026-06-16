import { Stack } from 'expo-router';
import { ServerProvider } from '../context/server-context.js';
import { ThemeProvider } from '../context/theme-context.js';

export default function RootLayout() {
    return (
        <ServerProvider>
            <ThemeProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                </Stack>
            </ThemeProvider>
        </ServerProvider>
    );
}