import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useContext } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ServerContext } from '../../context/server-context';
import { useAppTheme } from '../../context/theme-context.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../localization/translation.js';

export default function TabsLayout() {
    const { colors } = useAppTheme();
    const { user, setUser } = useContext(ServerContext);
    const router = useRouter();

    const handleLogout = async () => {
        setUser(null);
        
        await AsyncStorage.removeItem('saved_identifier');
        await AsyncStorage.removeItem('saved_password');
        
        router.replace('/(auth)/login');
    };

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
            tabBarInactiveTintColor: colors.textGrey,
            headerRight: () => user ? (
                <TouchableOpacity onPress={handleLogout} style={{ marginRight: 20 }}>
                    <MaterialCommunityIcons name="logout" size={24} color={colors.errorRed} />
                </TouchableOpacity>
            ) : null
        }}>
            <Tabs.Screen name="products" options={{ title: i18n.t('tab_store') }} />
            <Tabs.Screen name="spec-builder" options={{ title: i18n.t('tab_builder') }} />
            <Tabs.Screen name="profile" options={{ title: i18n.t('tab_profile') }} />
            <Tabs.Screen name="inventory" options={{ title: i18n.t('tab_inventory') }} />
        </Tabs>
    );
}