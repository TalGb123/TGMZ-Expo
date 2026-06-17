import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, BackHandler } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CategoryList from '../../components/category-list.jsx';
import { useStyles, useAppTheme } from '../../context/theme-context.js';
import { generateProductsStyles } from '../../constants/ProductsStyle.js';

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
    const { isLandscape, colors, screenWidth } = useAppTheme();
    const styles = useStyles(generateProductsStyles);
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