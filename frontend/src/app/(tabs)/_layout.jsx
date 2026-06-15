import { Tabs } from 'expo-router';
import { useAppTheme } from '../../context/theme-context.js';

export default function TabsLayout() {
    const { colors } = useAppTheme();

    return (
        <Tabs screenOptions={{ 
            headerShown: true,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.textMain,
            tabBarStyle: { 
                backgroundColor: colors.cardBackground, 
                borderTopColor: colors.borderColor 
            },
            tabBarActiveTintColor: colors.primaryAccent,
            tabBarInactiveTintColor: colors.textGrey
        }}>
            <Tabs.Screen 
                name="products" 
                options={{ title: 'Store' }} 
            />
            <Tabs.Screen 
                name="spec-builder" 
                options={{ title: 'PC Builder' }} 
            />
            <Tabs.Screen 
                name="profile" 
                options={{ title: 'Profile' }} 
            />
            <Tabs.Screen 
                name="inventory" 
                options={{ title: 'Inventory' }} 
            />
        </Tabs>
    );
}