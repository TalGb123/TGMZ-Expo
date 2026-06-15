import { View, Text, StyleSheet } from 'react-native';
import { useStyles } from '../../context/theme-context.js';

export default function InventoryScreen() {
    const styles = useStyles(generateStyles);
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Admin Inventory 📦</Text>
        </View>
    );
}

const generateStyles = (colors) => ({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background
    },
    text: { 
        fontSize: 20, 
        fontWeight: 'bold',
        color: colors.textMain
    }
});

