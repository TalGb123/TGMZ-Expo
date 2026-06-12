import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useStyles } from '../components/theme-context';

export default function NotFound() {
    const router = useRouter();
    const styles = useStyles(generateStyles);

    return (
        <View style={styles.container}> 
            <Pressable onPress={() => router.back()} style={styles.button}>
                <Text style={styles.text}>Not found. Click to go back.</Text>
            </Pressable>
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
    button: {
        padding: 15,
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    text: {
        fontSize: 16,
        color: colors.textMain,
        fontWeight: '500'
    }
});