import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ServerContext } from '../../components/server-context';
import { useStyles, useAppTheme } from '../../components/theme-context';

const SpecRow = ({ label, value, styles }) => {
    if (value === undefined || value === null || value === '') return null;
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

    return (
        <View style={styles.specRow}>
            <Text style={styles.specLabel}>{label}</Text>
            <Text style={styles.specValue}>{Array.isArray(displayValue) ? displayValue.join(', ') : displayValue}</Text>
        </View>
    );
};

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { server } = useContext(ServerContext);
    
    const styles = useStyles(generateStyles);
    const { isLandscape, colors } = useAppTheme();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || id === 'undefined') return;

        const fetchProduct = async () => {
            try {
                const response = await server.get(`/products/${id}`);
                setProduct(response.data);
            } catch (err) {
                console.error("Failed to fetch product details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <ActivityIndicator size="large" color={colors.primaryAccent} style={styles.center} />;
    if (!product) return <Text style={styles.errorText}>Product not found.</Text>;

    const renderDynamicSpecs = () => {
        // We pass the generated 'styles' object to SpecRow so it inherits the theme colors
        const commonProps = { styles }; 
        switch (product.category) {
            case 'CPU':
                return (
                    <>
                        <SpecRow label="Socket" value={product.socket} {...commonProps} />
                        <SpecRow label="Core Count" value={product.core_count} {...commonProps} />
                        <SpecRow label="Core Clock" value={`${product.core_clock} GHz`} {...commonProps} />
                        <SpecRow label="Boost Clock" value={product.boost_clock ? `${product.boost_clock} GHz` : null} {...commonProps} />
                        <SpecRow label="TDP" value={`${product.tdp} W`} {...commonProps} />
                    </>
                );
            // ... (keep the rest of your cases identical, just append {...commonProps} to each SpecRow)
            default:
                return <Text style={{ color: colors.textGrey, marginTop: 10 }}>No extended specifications available.</Text>;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.fixedHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backBtnText}>← Back to Store</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.layoutWrapper}>
                    <View style={styles.imageColumn}>
                        <Image 
                            source={{ uri: product.image || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png" }} 
                            style={styles.image} 
                            resizeMode="contain"
                        />
                        <View style={styles.titleContainer}>
                            <Text style={styles.brand}>{product.brand}</Text>
                            <Text style={styles.name}>{product.name}</Text>
                            <Text style={styles.price}>₪{product.price}</Text>
                            <Text style={[styles.stockStatus, { color: product.inStock ? colors.successGreen : colors.errorRed }]}>
                                {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.specsColumn}>
                        <View style={styles.specsCard}>
                            <Text style={styles.specsHeader}>Specifications</Text>
                            <View style={styles.divider} />
                            {renderDynamicSpecs()}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const generateStyles = (colors, isLandscape) => ({
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background
    },
    errorText: { 
        color: colors.errorRed, 
        textAlign: 'center', 
        marginTop: 50, 
        fontSize: 18
    },
    container: { 
        flex: 1, 
        backgroundColor: colors.background
    },
    fixedHeader: {
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderColor,
    },
    backBtn: {
        marginTop: 30,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    backBtnText: { 
        fontSize: 15, 
        fontWeight: '600', 
        color: colors.textMain 
    },
    scrollContent: { 
        padding: 20, 
        paddingBottom: 40 
    },
    layoutWrapper: {
        flexDirection: isLandscape ? 'row' : 'column',
        gap: 20,
    },
    imageColumn: {
        flex: isLandscape ? 1 : undefined,
    },
    specsColumn: {
        flex: isLandscape ? 1 : undefined,
    },
    image: { 
        width: '100%', 
        height: 250, 
        backgroundColor: colors.cardBackground, 
        borderRadius: 12, 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    titleContainer: { 
        backgroundColor: colors.cardBackground, 
        padding: 20, 
        borderRadius: 12, 
        marginBottom: isLandscape ? 0 : 20,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    brand: { 
        fontSize: 14, 
        color: colors.textGrey, 
        textTransform: 'uppercase', 
        fontWeight: 'bold', 
        marginBottom: 4 
    },
    name: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: colors.textMain, 
        marginBottom: 10 
    },
    price: { 
        fontSize: 26, 
        color: colors.primaryAccent, 
        fontWeight: 'bold', 
        marginBottom: 10 
    },
    stockStatus: { 
        fontSize: 16, 
        fontWeight: '600' 
    },
    specsCard: { 
        backgroundColor: colors.cardBackground, 
        padding: 20, 
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    specsHeader: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: colors.textMain, 
        marginBottom: 15 
    },
    divider: { 
        height: 1, 
        backgroundColor: colors.borderColor,
        marginBottom: 15 
    },
    specRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 12, 
        paddingBottom: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: colors.borderColor 
    },
    specLabel: { 
        fontSize: 16, 
        color: colors.textGrey, 
        flex: 1 
    },
    specValue: { 
        fontSize: 16, 
        fontWeight: '500', 
        color: colors.textMain, 
        flex: 1, 
        textAlign: 'right' 
    }
});