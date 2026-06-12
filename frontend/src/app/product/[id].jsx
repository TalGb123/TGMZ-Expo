import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ServerContext } from '../../components/server-context';

const SpecRow = ({ label, value }) => {
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

    if (loading) return <ActivityIndicator size="large" color="#007AFF" style={styles.center} />;
    if (!product) return <Text style={styles.errorText}>Product not found.</Text>;

    const renderDynamicSpecs = () => {
        switch (product.category) {
            case 'CPU':
                return (
                    <>
                        <SpecRow label="Socket" value={product.socket} />
                        <SpecRow label="Core Count" value={product.core_count} />
                        <SpecRow label="Core Clock" value={`${product.core_clock} GHz`} />
                        <SpecRow label="Boost Clock" value={product.boost_clock ? `${product.boost_clock} GHz` : null} />
                        <SpecRow label="TDP" value={`${product.tdp} W`} />
                        <SpecRow label="Includes APU" value={product.has_apu} />
                        <SpecRow label="Supported Memory" value={product.supported_memory} />
                    </>
                );
            case 'CPUCooler':
                return (
                    <>
                        <SpecRow label="Type" value={product.type} />
                        <SpecRow label="Supported Sockets" value={product.supported_sockets} />
                        <SpecRow label="Height" value={product.height ? `${product.height} mm` : null} />
                        <SpecRow label="Radiator Size" value={product.radiator_size ? `${product.radiator_size} mm` : 'N/A (Air)'} />
                        <SpecRow label="Noise Level" value={product.noise_level ? `${product.noise_level} dB` : null} />
                        <SpecRow label="Max Cooling (TDP)" value={`${product.max_tdp_cooling} W`} />
                        <SpecRow label="Color" value={product.color} />
                    </>
                );
            case 'Motherboard':
                return (
                    <>
                        <SpecRow label="Socket" value={product.socket} />
                        <SpecRow label="Form Factor" value={product.form_factor} />
                        <SpecRow label="Memory Gen" value={product.memory_gen} />
                        <SpecRow label="Memory Slots" value={product.memory_slots} />
                        <SpecRow label="M.2 Slots" value={product.m2_slots} />
                        <SpecRow label="WiFi & Bluetooth" value={product.has_wifi_bluetooth} />
                        <SpecRow label="VRM Tier" value={`${product.vrm_tier}/5`} />
                        <SpecRow label="Rear Connections" value={product.connections} />
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
                        <SpecRow label="Configuration" value={`${sticks} x ${capacity}GB`} />
                        <SpecRow label="Speed" value={`${gen} ${mhz} MHz`} />
                        <SpecRow label="CAS Latency" value={`CL${cl}`} />
                        <SpecRow label="Color" value={product.color} />
                    </>
                );
            case 'Storage':
                return (
                    <>
                        <SpecRow label="Capacity" value={`${product.capacity} GB`} />
                        <SpecRow label="Drive Type" value={product.type} />
                        <SpecRow label="Form Factor" value={product.form_factor} />
                    </>
                );
            case 'VideoCard':
                return (
                    <>
                        <SpecRow label="Chipset" value={product.chipset} />
                        <SpecRow label="VRAM" value={`${product.memory} GB`} />
                        <SpecRow label="Length" value={`${product.length} mm`} />
                        <SpecRow label="Slots Required" value={product.slots_required} />
                        <SpecRow label="TDP" value={`${product.tdp} W`} />
                        <SpecRow label="Recommended PSU" value={`${product.recommended_psu_wattage} W`} />
                        <SpecRow label="Color" value={product.color} />
                    </>
                );
            case 'Case':
                return (
                    <>
                        <SpecRow label="Type" value={product.type} />
                        <SpecRow label="Max GPU Length" value={`${product.max_gpu_length} mm`} />
                        <SpecRow label="Max Cooler Height" value={`${product.max_cpu_cooler_height} mm`} />
                        <SpecRow label="PSU Form Factor" value={product.psu_form_factor} />
                        <SpecRow label="Supported Radiators" value={product.supported_radiators?.map(r => `${r}mm`)} />
                        <SpecRow label="Side Panel" value={product.sidepanel_material} />
                    </>
                );
            case 'PowerSupply':
                return (
                    <>
                        <SpecRow label="Wattage" value={`${product.wattage} W`} />
                        <SpecRow label="Type" value={product.type} />
                        <SpecRow label="Efficiency" value={product.efficiency} />
                        <SpecRow label="Modular" value={product.modular} />
                        <SpecRow label="Color" value={product.color} />
                    </>
                );
            default:
                return <Text style={{ color: '#888', marginTop: 10 }}>No extended specifications available.</Text>;
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
                <Image 
                    source={{ uri: product.image || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png" }} 
                    style={styles.image} 
                    resizeMode="contain"
                />
                
                <View style={styles.titleContainer}>
                    <Text style={styles.brand}>{product.brand}</Text>
                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.price}>₪{product.price}</Text>
                    <Text style={[styles.stockStatus, { color: product.inStock ? '#28a745' : '#dc3545' }]}>
                        {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                    </Text>
                </View>

                <View style={styles.specsCard}>
                    <Text style={styles.specsHeader}>Specifications</Text>
                    <View style={styles.divider} />
                    {renderDynamicSpecs()}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    errorText: { 
        color: 'red', 
        textAlign: 'center', 
        marginTop: 50, 
        fontSize: 18
    },
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5'
    },
    fixedHeader: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backBtn: {
        marginTop: 30,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    backBtnText: { 
        fontSize: 15, 
        fontWeight: '600', 
        color: '#333' 
    },
    scrollContent: { 
        padding: 20, 
        paddingBottom: 40 
    },
    image: { 
        width: '100%', 
        height: 250, 
        backgroundColor: '#fff', 
        borderRadius: 12, 
        marginBottom: 20 
    },
    titleContainer: { 
        backgroundColor: '#fff', 
        padding: 20, 
        borderRadius: 12, 
        marginBottom: 20 
    },
    brand: { 
        fontSize: 14, 
        color: '#888', 
        textTransform: 'uppercase', 
        fontWeight: 'bold', 
        marginBottom: 4 
    },
    name: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#333', 
        marginBottom: 10 
    },
    price: { 
        fontSize: 26, 
        color: '#007AFF', 
        fontWeight: 'bold', 
        marginBottom: 10 
    },
    stockStatus: { 
        fontSize: 16, 
        fontWeight: '600' 
    },
    specsCard: { 
        backgroundColor: '#fff', 
        padding: 20, 
        borderRadius: 12 
    },
    specsHeader: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#333', 
        marginBottom: 15 
    },
    divider: { 
        height: 1, 
        backgroundColor: '#eee',
        marginBottom: 15 
    },
    specRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 12, 
        paddingBottom: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: '#f9f9f9' 
    },
    specLabel: { 
        fontSize: 16, 
        color: '#666', 
        flex: 1 
    },
    specValue: { 
        fontSize: 16, 
        fontWeight: '500', 
        color: '#333', 
        flex: 1, 
        textAlign: 'right' 
    }
});