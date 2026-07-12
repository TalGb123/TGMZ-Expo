import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, BackHandler } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CategoryList from '../../components/category-list.jsx';
import { useStyles, useAppTheme } from '../../context/theme-context.js';
import { generateProductsStyles } from '../../constants/ProductsStyle.js';
import i18n from '../../localization/translation.js';

const hardwareCategories = [
    { translationKey: "cat_cpu", dbName: "CPU", img: "../../../assets/cpu.png" },
    { translationKey: "cat_cooler", dbName: "CPUCooler", img: "../../../assets/cooler.png" },
    { translationKey: "cat_mobo", dbName: "Motherboard", img: "../../../assets/motherboard.png" },
    { translationKey: "cat_ram", dbName: "Memory", img: "../../../assets/ram.png" },
    { translationKey: "cat_storage", dbName: "Storage", img: "../../../assets/storage.png" },
    { translationKey: "cat_gpu", dbName: "VideoCard", img: "../../../assets/gpu.png" },
    { translationKey: "cat_psu", dbName: "PowerSupply", img: "../../../assets/psu.png" },
    { translationKey: "cat_case", dbName: "Case", img: "../../../assets/case.png" }
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
                    <Text style={styles.pageTitle}>{i18n.t('products_browse')}</Text>
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
                                <Text style={styles.bubbleText}>{i18n.t(cat.translationKey)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.listViewWrapper}>
                    <View style={styles.headerRow}>
                        <Text style={styles.activeCategoryTitle}>
                            {hardwareCategories.find(c => c.dbName === category) 
                                ? i18n.t(hardwareCategories.find(c => c.dbName === category).translationKey) 
                                : i18n.t('products_fallback_title')}
                        </Text>
                        <TouchableOpacity style={styles.backBtn} onPress={clearCategory}>
                            <Text style={styles.backBtnText}>{i18n.t('products_back')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.listWrapper}>
                        <CategoryList category={category} />
                    </View>
                </View>
            )}
        </View>
    );
}