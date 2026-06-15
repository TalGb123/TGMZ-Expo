import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ServerContext } from '../../context/server-context.js';
import { useStyles, useAppTheme } from '../../context/theme-context.js';

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
                        <SpecRow label="Includes APU" value={product.has_apu} {...commonProps} />
                        <SpecRow label="Supported Memory" value={product.supported_memory} {...commonProps} />
                    </>
                );
            case 'CPUCooler':
                return (
                    <>
                        <SpecRow label="Type" value={product.type} {...commonProps} />
                        <SpecRow label="Supported Sockets" value={product.supported_sockets} {...commonProps} />
                        <SpecRow label="Height" value={product.height ? `${product.height} mm` : null} {...commonProps} />
                        <SpecRow label="Radiator Size" value={product.radiator_size ? `${product.radiator_size} mm` : 'N/A (Air)'} {...commonProps} />
                        <SpecRow label="Noise Level" value={product.noise_level ? `${product.noise_level} dB` : null} {...commonProps} />
                        <SpecRow label="Max Cooling (TDP)" value={`${product.max_tdp_cooling} W`} {...commonProps} />
                        <SpecRow label="Color" value={product.color} {...commonProps} />
                    </>
                );
            case 'Motherboard':
                return (
                    <>
                        <SpecRow label="Socket" value={product.socket} {...commonProps} />
                        <SpecRow label="Form Factor" value={product.form_factor} {...commonProps} />
                        <SpecRow label="Memory Gen" value={product.memory_gen} {...commonProps} />
                        <SpecRow label="Memory Slots" value={product.memory_slots} {...commonProps} />
                        <SpecRow label="M.2 Slots" value={product.m2_slots} {...commonProps} />
                        <SpecRow label="WiFi & Bluetooth" value={product.has_wifi_bluetooth} {...commonProps} />
                        <SpecRow label="VRM Tier" value={`${product.vrm_tier}/5`} {...commonProps} />
                        <SpecRow label="Rear Connections" value={product.connections} {...commonProps} />
                    </>
                );
            case 'Memory':
                const gen = product.speed?.[0] || '';
                const mhz = product.speed?.[1] || '';
                const cl = product.speed?.[2] || '';
                const sticks = product.modules?.[0] || '';
                const capacity = product.modules?.[1] || '';
                return (
                    <>
                        <SpecRow label="Configuration" value={`${sticks} x ${capacity}GB`} {...commonProps} />
                        <SpecRow label="Speed" value={`${gen} ${mhz} MHz`} {...commonProps} />
                        <SpecRow label="CAS Latency" value={`CL${cl}`} {...commonProps} />
                        <SpecRow label="Color" value={product.color} {...commonProps} />
                    </>
                );
            case 'Storage':
                return (
                    <>
                        <SpecRow label="Capacity" value={`${product.capacity} GB`} {...commonProps} />
                        <SpecRow label="Drive Type" value={product.type} {...commonProps} />
                        <SpecRow label="Form Factor" value={product.form_factor} {...commonProps} />
                    </>
                );
            case 'VideoCard':
                return (
                    <>
                        <SpecRow label="Chipset" value={product.chipset} {...commonProps} />
                        <SpecRow label="VRAM" value={`${product.memory} GB`} {...commonProps} />
                        <SpecRow label="Length" value={`${product.length} mm`} {...commonProps} />
                        <SpecRow label="Slots Required" value={product.slots_required} {...commonProps} />
                        <SpecRow label="TDP" value={`${product.tdp} W`} {...commonProps} />
                        <SpecRow label="Recommended PSU" value={`${product.recommended_psu_wattage} W`} {...commonProps} />
                        <SpecRow label="Color" value={product.color} {...commonProps} />
                    </>
                );
            case 'Case':
                return (
                    <>
                        <SpecRow label="Type" value={product.type} {...commonProps} />
                        <SpecRow label="Max GPU Length" value={`${product.max_gpu_length} mm`} {...commonProps} />
                        <SpecRow label="Max Cooler Height" value={`${product.max_cpu_cooler_height} mm`} {...commonProps} />
                        <SpecRow label="PSU Form Factor" value={product.psu_form_factor} {...commonProps} />
                        <SpecRow label="Supported Radiators" value={product.supported_radiators?.map(r => `${r}mm`)} {...commonProps} />
                        <SpecRow label="Side Panel" value={product.sidepanel_material} {...commonProps} />
                    </>
                );
            case 'PowerSupply':
                return (
                    <>
                        <SpecRow label="Wattage" value={`${product.wattage} W`} {...commonProps} />
                        <SpecRow label="Type" value={product.type} {...commonProps} />
                        <SpecRow label="Efficiency" value={product.efficiency} {...commonProps} />
                        <SpecRow label="Modular" value={product.modular} {...commonProps} />
                        <SpecRow label="Color" value={product.color} {...commonProps} />
                    </>
                );
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

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
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