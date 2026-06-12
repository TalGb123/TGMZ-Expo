import { Stack } from 'expo-router';
import { useAppTheme } from '../../components/theme-context';

export default function AuthLayout() {
    const { colors } = useAppTheme();

    return (
        <Stack screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.textMain,
            headerShadowVisible: false, // Cleaner look
        }}>
            <Stack.Screen name="login" options={{ title: 'Sign In' }} />
            <Stack.Screen name="register" options={{ title: 'Create Account' }} />
        </Stack>
    );
}