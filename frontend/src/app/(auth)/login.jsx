import { View, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useStyles } from '../../context/theme-context.js';

export default function LoginScreen() {
    const router = useRouter();
    const styles = useStyles(generateStyles);

    const handleMockLogin = () => {
        router.replace('/(tabs)/products');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome to TGMZ</Text>
            <Text style={styles.subHeader}>Please sign in to continue</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleMockLogin}>
                <Text style={styles.btnText}>Bypass Login and Go to Store</Text>
            </TouchableOpacity>
            <Link href="/(auth)/register" asChild>
                <TouchableOpacity style={styles.secondaryBtn}>
                    <Text style={styles.secondaryBtnText}>No account? Register here</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const generateStyles = (colors) => ({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20
    },
    header: { 
        fontSize: 28, 
        fontWeight: 'bold',
        color: colors.textMain,
        marginBottom: 8
    },
    subHeader: {
        fontSize: 16,
        color: colors.textGrey,
        marginBottom: 40
    },
    primaryBtn: {
        backgroundColor: colors.primaryAccent, // Swapped standard blue for your app's green
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    btnText: {
        color: '#fff', // Keep white for contrast against the green button
        fontSize: 16,
        fontWeight: 'bold'
    },
    secondaryBtn: {
        paddingVertical: 15,
    },
    secondaryBtnText: {
        color: colors.textMain,
        fontSize: 14,
        fontWeight: '600'
    }
});