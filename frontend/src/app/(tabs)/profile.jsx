import { View, Text, StyleSheet } from 'react-native';
import { useStyles } from '../../components/theme-context';

export default function ProfileScreen() {
    const styles = useStyles(generateStyles);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>User Profile 👤</Text>
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