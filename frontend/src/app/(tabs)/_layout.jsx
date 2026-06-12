import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: true }}>
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
                options={{ 
                    title: 'Inventory',
                }} 
            />
        </Tabs>
    );
}