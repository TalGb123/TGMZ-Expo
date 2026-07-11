import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ServerContext } from '../../context/server-context.js';
import { useStyles, useAppTheme } from '../../context/theme-context.js';
import { generateProductDetailStyles } from '../../constants/ProductDetailStyle.js';
import i18n from '../../localization/translation.js';

const SpecRow = ({ label, value, styles }) => {
    if (value === undefined || value === null || value === '') return null;
    const displayValue = typeof value === 'boolean' ? (value ? i18n.t('common_yes') : i18n.t('common_no')) : value;

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
    
    const styles = useStyles(generateProductDetailStyles);
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

    useEffect(() => {
        const onHardwareBackPress = () => {
            router.back();
            return true;
        };
        const backSubscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
        return () => backSubscription.remove();
    }, [router]);

    if (loading) return <ActivityIndicator size="large" color={colors.primaryAccent} style={styles.center} />;
    if (!product) return <Text style={styles.errorText}>{i18n.t('prod_not_found')}</Text>;

    const renderDynamicSpecs = () => {
        const commonProps = { styles }; 
        switch (product.category) {
            case 'CPU':
                return (
                    <>
                        <SpecRow label={i18n.t('spec_socket')} value={product.socket} {...commonProps} />
                        <SpecRow label={i18n.t('spec_core_count')} value={product.core_count} {...commonProps} />
                        <SpecRow label={i18n.t('spec_core_clock')} value={`${product.core_clock} GHz`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_boost_clock')} value={product.boost_clock ? `${product.boost_clock} GHz` : null} {...commonProps} />
                        <SpecRow label={i18n.t('spec_tdp')} value={`${product.tdp} W`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_apu')} value={product.has_apu} {...commonProps} />
                        <SpecRow label={i18n.t('spec_memory_support')} value={product.supported_memory} {...commonProps} />
                    </>
                );
            case 'CPUCooler':
                return (
                    <>
                        <SpecRow label={i18n.t('spec_type')} value={product.type} {...commonProps} />
                        <SpecRow label={i18n.t('spec_socket')} value={product.supported_sockets} {...commonProps} />
                        <SpecRow label={i18n.t('spec_height')} value={product.height ? `${product.height} mm` : null} {...commonProps} />
                        <SpecRow label={i18n.t('spec_rad_size')} value={product.radiator_size ? `${product.radiator_size} mm` : i18n.t('spec_na_air')} {...commonProps} />
                        <SpecRow label={i18n.t('spec_noise')} value={product.noise_level ? `${product.noise_level} dB` : null} {...commonProps} />
                        <SpecRow label={i18n.t('spec_max_tdp')} value={`${product.max_tdp_cooling} W`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_color')} value={product.color} {...commonProps} />
                    </>
                );
            case 'Motherboard':
                return (
                    <>
                        <SpecRow label={i18n.t('spec_socket')} value={product.socket} {...commonProps} />
                        <SpecRow label={i18n.t('spec_form_factor')} value={product.form_factor} {...commonProps} />
                        <SpecRow label={i18n.t('spec_mem_gen')} value={product.memory_gen} {...commonProps} />
                        <SpecRow label={i18n.t('spec_mem_slots')} value={product.memory_slots} {...commonProps} />
                        <SpecRow label={i18n.t('spec_m2_slots')} value={product.m2_slots} {...commonProps} />
                        <SpecRow label={i18n.t('spec_wifi_bt')} value={product.has_wifi_bluetooth} {...commonProps} />
                        <SpecRow label={i18n.t('spec_vrm')} value={`${product.vrm_tier}/5`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_rear_io')} value={product.connections} {...commonProps} />
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
                        <SpecRow label={i18n.t('spec_config')} value={`${sticks} x ${capacity}GB`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_speed')} value={`${gen} ${mhz} MHz`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_cas')} value={`CL${cl}`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_color')} value={product.color} {...commonProps} />
                    </>
                );
            case 'Storage':
                return (
                    <>
                        <SpecRow label={i18n.t('spec_capacity')} value={`${product.capacity} GB`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_drive_type')} value={product.type} {...commonProps} />
                        <SpecRow label={i18n.t('spec_form_factor')} value={product.form_factor} {...commonProps} />
                    </>
                );
            case 'VideoCard':
                return (
                    <>
                        <SpecRow label={i18n.t('spec_chipset')} value={product.chipset} {...commonProps} />
                        <SpecRow label={i18n.t('spec_vram')} value={`${product.memory} GB`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_length')} value={`${product.length} mm`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_slots_req')} value={product.slots_required} {...commonProps} />
                        <SpecRow label={i18n.t('spec_tdp')} value={`${product.tdp} W`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_rec_psu')} value={`${product.recommended_psu_wattage} W`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_color')} value={product.color} {...commonProps} />
                    </>
                );
            case 'Case':
                return (
                    <>
                        <SpecRow label={i18n.t('spec_type')} value={product.type} {...commonProps} />
                        <SpecRow label={i18n.t('spec_max_gpu')} value={`${product.max_gpu_length} mm`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_max_cooler')} value={`${product.max_cpu_cooler_height} mm`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_psu_form')} value={product.psu_form_factor} {...commonProps} />
                        <SpecRow label={i18n.t('spec_rad_support')} value={product.supported_radiators?.map(r => `${r}mm`)} {...commonProps} />
                        <SpecRow label={i18n.t('spec_side_panel')} value={product.sidepanel_material} {...commonProps} />
                    </>
                );
            case 'PowerSupply':
                return (
                    <>
                        <SpecRow label={i18n.t('spec_wattage')} value={`${product.wattage} W`} {...commonProps} />
                        <SpecRow label={i18n.t('spec_type')} value={product.type} {...commonProps} />
                        <SpecRow label={i18n.t('spec_efficiency')} value={product.efficiency} {...commonProps} />
                        <SpecRow label={i18n.t('spec_modular')} value={product.modular} {...commonProps} />
                        <SpecRow label={i18n.t('spec_color')} value={product.color} {...commonProps} />
                    </>
                );
            default:
                return <Text style={{ color: colors.textGrey, marginTop: 10 }}>{i18n.t('prod_no_specs')}</Text>;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.fixedHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backBtnText}>{i18n.t('prod_back_store')}</Text>
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
                                {product.inStock ? i18n.t('prod_in_stock') : i18n.t('prod_out_stock')}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.specsColumn}>
                        <View style={styles.specsCard}>
                            <Text style={styles.specsHeader}>{i18n.t('prod_specs_title')}</Text>
                            <View style={styles.divider} />
                            {renderDynamicSpecs()}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}