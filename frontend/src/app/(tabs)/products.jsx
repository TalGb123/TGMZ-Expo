import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, BackHandler } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CategoryList from '../../components/category-list';
import { useStyles, useAppTheme } from '../../components/theme-context';

const hardwareCategories = [
    { name: "CPU", dbName: "CPU", img: "../../../assets/cpu.png" },
    { name: "CPU Cooler", dbName: "CPUCooler", img: "../../../assets/cooler.png" },
    { name: "Motherboard", dbName: "Motherboard", img: "../../../assets/motherboard.png" },
    { name: "RAM", dbName: "Memory", img: "../../../assets/ram.png" },
    { name: "Storage", dbName: "Storage", img: "../../../assets/storage.png" },
    { name: "GPU", dbName: "VideoCard", img: "../../../assets/gpu.png" },
    { name: "Power Supply", dbName: "PowerSupply", img: "../../../assets/psu.png" },
    { name: "Case", dbName: "Case", img: "../../../assets/case.png" }
];

export default function ProductsScreen() {
    const router = useRouter();
    const { category } = useLocalSearchParams();
    const styles = useStyles(generateStyles);
    const { isLandscape } = useAppTheme();
    const setCategory = (dbName) => {
        router.setParams({ category: dbName });
    };
    const clearCategory = () => {
        router.setParams({ category: "" });
    };
    useEffect(() => {
        const onHardwareBackPress = () => {
            if (category) {
                clearCategory();
                return true; 
            }
            return false; 
        };
        const backSubscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
        return () => backSubscription.remove();
    }, [category]);

    return (
        <View style={styles.container}>
            {!category ? (
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.pageTitle}>Browse Categories</Text>
                    <View style={styles.grid}>
                        {hardwareCategories.map((cat, idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                style={styles.categoryBubble}
                                activeOpacity={0.7}
                                onPress={() => setCategory(cat.dbName)}
                            >
                                <Image 
                                    source={{ uri: cat.img }} 
                                    style={styles.bubbleImage} 
                                    resizeMode="contain"
                                />
                                <Text style={styles.bubbleText}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.listViewWrapper}>
                    <View style={styles.headerRow}>
                        <Text style={styles.activeCategoryTitle}>
                            {hardwareCategories.find(c => c.dbName === category)?.name || "Products"}
                        </Text>
                        <TouchableOpacity style={styles.backBtn} onPress={clearCategory}>
                            <Text style={styles.backBtnText}>← Back</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.listWrapper}>
                        <CategoryList 
                            category={category} 
                            onSelect={(part) => console.log("Added to cart:", part)} 
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const generateStyles = (colors, isLandscape, screenWidth) => ({
    container: {
        flex: 1,
        backgroundColor: colors.background, // This fixes the white background behind the list!
    },
    content: {
        padding: isLandscape ? 40 : 20,
        paddingBottom: 40,
    },
    listViewWrapper: {
        flex: 1,
        padding: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 30,
        color: colors.textMain,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: isLandscape ? "flex-start" : "space-between",
        gap: 15,
    },
    categoryBubble: {
        width: isLandscape ? (screenWidth - 125) / 4 : "47%", 
        backgroundColor: colors.cardBackground,
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    bubbleImage: {
        width: isLandscape ? 45 : 55,
        height: isLandscape ? 45 : 55,
        marginBottom: 12,
    },
    bubbleText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textMain,
        textAlign: "center",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    activeCategoryTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: colors.textMain,
    },
    backBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    backBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textMain,
    },
    listWrapper: { 
        flex: 1, 
    }
});