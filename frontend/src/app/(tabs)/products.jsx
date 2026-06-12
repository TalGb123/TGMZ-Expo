import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CategoryList from '../../components/category-list';

// lazy adding pics for now
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

    const setCategory = (dbName) => {
        router.setParams({ category: dbName });
    };

    const clearCategory = () => {
        router.setParams({ category: "" });
    };

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
                                onPress={() => setCategory(cat.dbName)}
                                activeOpacity={0.7}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    content: {
        padding: 20,
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
        color: "#333",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 15,
    },
    categoryBubble: {
        width: "47%", 
        backgroundColor: "#ffffff",
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
    },
    bubbleImage: {
        width: 55,
        height: 55,
        marginBottom: 12,
    },
    bubbleText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#444",
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
        color: "#333",
    },
    backBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#e0e0e0",
        borderRadius: 8,
    },
    backBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    listWrapper: { 
        flex: 1, 
    }
});