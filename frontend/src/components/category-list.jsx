import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { ServerContext } from '../context/server-context.js';
import { useStyles, useAppTheme } from '../context/theme-context.js';
import { useRouter } from 'expo-router';
import { generateCategoryListStyles } from '../constants/CategoryListStyle.js';
import i18n from '../localization/translation.js';
import { checkCompatibility } from '../utils/compatibility.js';

const normalizePart = (p) => {
    const clone = { ...p };
    if (clone.category === "Memory" && Array.isArray(clone.speed)) {
        clone.speedMain = clone.speed.length > 1 ? clone.speed[1] : clone.speed[0];
    }
    if (clone.category === "Memory" && clone.speedMain) {
        if (clone.speedMain >= 4800) clone.ddrGen = "DDR5";
        else if (clone.speedMain >= 2400) clone.ddrGen = "DDR4";
        else clone.ddrGen = "DDR3";
    }
    if (clone.category === "Memory" && Array.isArray(clone.modules) && clone.modules.length >= 2) {
        const [count, size] = clone.modules;
        clone.modulesLabel = `${count}x${size}`;
    }
    return clone;
};

const FILTERS = {
    CPU: [
        { key: "brand", type: "select", translationKey: "inv_prop_brand" },
        { key: "socket", type: "select", translationKey: "spec_socket" },
        { key: "supported_memory", type: "select", translationKey: "catlist_lbl_memory" },
        { key: "has_apu", type: "select", translationKey: "inv_prop_has_apu" },
        { key: "tdp", type: "range", translationKey: "inv_prop_tdp" },
        { key: "core_clock", type: "range", translationKey: "catlist_lbl_clock" },
    ],
    CPUCooler: [
        { key: "brand", type: "select", translationKey: "inv_prop_brand" },
        { key: "type", type: "select", translationKey: "spec_type" },
        { key: "radiator_size", type: "select", translationKey: "catlist_lbl_rad_size" },
        { key: "supported_sockets", type: "select", translationKey: "inv_prop_supp_sockets" },
        { key: "height", type: "range", translationKey: "inv_prop_height" },
    ],
    Motherboard: [
        { key: "brand", type: "select", translationKey: "inv_prop_brand" },
        { key: "socket", type: "select", translationKey: "spec_socket" },
        { key: "form_factor", type: "select", translationKey: "spec_form_factor" },
        { key: "memory_gen", type: "select", translationKey: "spec_mem_gen" },
        { key: "has_wifi_bluetooth", type: "select", translationKey: "inv_prop_bt_wifi" },
    ],
    Memory: [
        { key: "brand", type: "select", translationKey: "inv_prop_brand" },
        { key: "ddrGen", type: "select", translationKey: "catlist_lbl_ddr" },
        { key: "speedMain", type: "select", translationKey: "inv_prop_speed" },
        { key: "modulesLabel", type: "select", translationKey: "catlist_lbl_modules" },
        { key: "cas_latency", type: "range", translationKey: "spec_cas" },
    ],
    Storage: [
        { key: "brand", type: "select", translationKey: "inv_prop_brand" },
        { key: "capacity", type: "select", translationKey: "inv_prop_capacity" },
        { key: "drive_type", type: "select", translationKey: "spec_drive_type" },
        { key: "form_factor", type: "select", translationKey: "spec_form_factor" },
    ],
    PowerSupply: [
        { key: "brand", type: "select", translationKey: "inv_prop_brand" },
        { key: "wattage", type: "range", translationKey: "inv_prop_wattage" },
        { key: "efficiency", type: "select", translationKey: "spec_efficiency" },
        { key: "type", type: "select", translationKey: "spec_type" },
        { key: "modular", type: "select", translationKey: "spec_modular" },
    ],
    VideoCard: [
        { key: "brand", type: "select", translationKey: "inv_prop_brand" },
        { key: "chipset", type: "select", translationKey: "spec_chipset" },
        { key: "memory", type: "select", translationKey: "inv_prop_memory_gb" },
        { key: "tdp", type: "range", translationKey: "inv_prop_tdp" },
        { key: "length", type: "range", translationKey: "inv_prop_length" },
    ],
    Case: [
        { key: "brand", type: "select", translationKey: "inv_prop_brand" },
        { key: "type", type: "select", translationKey: "spec_type" },
        { key: "supported_mobo_form_factors", type: "select", translationKey: "catlist_lbl_mobo_sizes" },
        { key: "max_gpu_length", type: "range", translationKey: "catlist_lbl_max_gpu" },
        { key: "psu_form_factor", type: "select", translationKey: "spec_psu_form" },
    ],
};

export default function CategoryList({ category, onSelect, selections = {} }) {
    const styles = useStyles(generateCategoryListStyles);
    const { colors } = useAppTheme();
    const router = useRouter();
    const { server } = useContext(ServerContext);
    
    const [parts, setParts] = useState([]);
    const [globalOptions, setGlobalOptions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [advFilters, setAdvFilters] = useState({ minPrice: "", maxPrice: "", values: {} });
    const [sortBy, setSortBy] = useState('');

    const filterDefs = FILTERS[category] || [];

    useEffect(() => {
        const fetchInitialOptions = async () => {
            try {
                const response = await server.get(`/products/category/${category}`);
                const normalized = response.data.map(normalizePart);
                
                const map = {};
                filterDefs.forEach(f => {
                    if (f.key === "has_apu" || f.key === "has_wifi_bluetooth") {
                        map[f.key] = ["true", "false"];
                    }
                    else if (f.type === "select") {
                        const valuesSet = new Set();
                        normalized.forEach(p => {
                            let val = p[f.key];
                            if (val !== null && val !== undefined && val !== "") {
                                if (Array.isArray(val)) val.forEach(v => valuesSet.add(v));
                                else if (typeof val === "boolean") valuesSet.add(val.toString());
                                else valuesSet.add(val);
                            }
                        });
                        map[f.key] = Array.from(valuesSet).sort();
                    }
                });
                setGlobalOptions(map);
            } catch (err) {
                console.error("Could not load initial options map", err);
            }
        };
        if (category) fetchInitialOptions();
    }, [category, server]);

    const fetchParts = async () => {
        setLoading(true);
        try {
            const params = {
                name: searchQuery,
                minPrice: advFilters.minPrice,
                maxPrice: advFilters.maxPrice,
                sortBy: sortBy
            };
            
            for (const [key, value] of Object.entries(advFilters.values)) {
                if (value) params[key] = value;
            }

            const response = await server.get(`/products/category/${category}`, { params });
            const normalized = response.data.map(normalizePart);
            setParts(normalized);
            setError(null);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(i18n.t('catlist_err_fetch'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (category) fetchParts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [category, server, searchQuery, advFilters, sortBy]);

    const handleSelectFilter = (key, val) => {
        setAdvFilters(prev => {
            const isSelected = prev.values[key] === val;
            return {
                ...prev,
                values: { ...prev.values, [key]: isSelected ? "" : val }
            };
        });
    };

    const processedParts = useMemo(() => {
        if (!parts) return [];
        
        return parts.map(part => {
            // If we are in the Store (no onSelect passed)
            if (!onSelect || Object.keys(selections).length === 0) {
                return { ...part, isCompatible: true, isWarning: false, reason: null };
            }
            
            // If we are in the Spec Builder, run compatibility checks
            const compat = checkCompatibility(part, selections);
            return { ...part, ...compat };

        }).sort((a, b) => {
            // Sort: Clean (1) -> Warning (2) -> Error (3)
            const getScore = (p) => {
                if (!p.isCompatible) return 3;
                if (p.isWarning) return 2;
                return 1;
            };
            return getScore(a) - getScore(b);
        });
    }, [parts, selections, onSelect]);

    const renderPart = ({ item }) => {
        // Default styling
        let bgColor = "transparent";
        let borderColor = "transparent";
        let icon = null;
        let textColor = colors.textGrey;

        // Apply Red Error Styles
        if (!item.isCompatible) {
            bgColor = 'rgba(255, 0, 0, 0.05)';
            borderColor = colors.errorRed;
            textColor = colors.errorRed;
            icon = "❌";
        } 
        // Apply Yellow Warning Styles
        else if (item.isWarning) {
            bgColor = 'rgba(255, 165, 0, 0.1)';
            borderColor = '#d97706'; // Dark amber/yellow
            textColor = '#d97706';
            icon = "⚠️";
        }

        return (
            <View style={[styles.card, { backgroundColor: bgColor, borderColor: borderColor, borderWidth: borderColor !== "transparent" ? 1 : 0 }]}>
                <Image 
                    source={{ uri: item.image || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png" }} 
                    style={styles.image} 
                    resizeMode="contain"
                />
                <View style={styles.details}>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <Text style={[styles.name, { flex: 1 }]} numberOfLines={2}>{item.name}</Text>
                        {icon && <Text style={{ fontSize: 16, marginLeft: 5 }}>{icon}</Text>}
                    </View>

                    <Text style={styles.price}>₪{item.price}</Text>

                    {/* Show explicit compatibility reason on mobile since we don't have tooltips */}
                    {item.reason && (
                        <Text style={{ fontSize: 12, color: textColor, marginTop: 4, marginBottom: 8, fontWeight: '500' }}>
                            {item.reason}
                        </Text>
                    )}

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: item.reason ? 0 : 8 }}>
                        <TouchableOpacity 
                            style={[styles.addBtn, { flex: 1, backgroundColor: '#6c757d' }]} 
                            onPress={() => router.push(`/product/${item._id}`)}
                        >
                            <Text style={styles.addBtnText}>{i18n.t('catlist_view_details')}</Text>
                        </TouchableOpacity>
                        
                        {/* Only show "Add to PC" if accessed from the Spec Builder */}
                        {onSelect && (
                            <TouchableOpacity style={[styles.addBtn, { flex: 1 }]} onPress={() => onSelect(item)}>
                                <Text style={styles.addBtnText}>{i18n.t('catlist_add_pc')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.filterToggleBtn} onPress={() => setShowFilters(!showFilters)}>
                <Text style={styles.filterToggleText}>
                    {showFilters ? i18n.t('catlist_hide_filters') : i18n.t('catlist_show_filters')}
                </Text>
            </TouchableOpacity>

            {showFilters && (
                <View style={styles.filterPanel}>
                    {/* Basic Name & Price */}
                    <TextInput 
                        style={styles.input} 
                        placeholder={i18n.t('inventory_search')} 
                        placeholderTextColor={StyleSheet.flatten(styles.input).color === '#fff' ? '#888' : '#aaa'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <View style={styles.row}>
                        <TextInput 
                            style={[styles.input, styles.halfInput]} 
                            placeholder={i18n.t('catlist_min_price')}
                            placeholderTextColor={StyleSheet.flatten(styles.input).color === '#fff' ? '#888' : '#aaa'}
                            keyboardType="numeric"
                            value={advFilters.minPrice}
                            onChangeText={text => setAdvFilters(prev => ({ ...prev, minPrice: text }))}
                        />
                        <TextInput 
                            style={[styles.input, styles.halfInput]} 
                            placeholder={i18n.t('catlist_max_price')}
                            placeholderTextColor={StyleSheet.flatten(styles.input).color === '#fff' ? '#888' : '#aaa'}
                            keyboardType="numeric"
                            value={advFilters.maxPrice}
                            onChangeText={text => setAdvFilters(prev => ({ ...prev, maxPrice: text }))}
                        />
                    </View>

                    {/* Sorting */}
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.sortBtn, sortBy === 'price-asc' && styles.activeSort]} onPress={() => setSortBy('price-asc')}>
                            <Text style={[styles.sortText, sortBy === 'price-asc' && styles.activeSortText]}>{i18n.t('catlist_sort_asc')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.sortBtn, sortBy === 'price-desc' && styles.activeSort]} onPress={() => setSortBy('price-desc')}>
                            <Text style={[styles.sortText, sortBy === 'price-desc' && styles.activeSortText]}>{i18n.t('catlist_sort_desc')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* DYNAMIC CATEGORY FILTERS */}
                    <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                        {filterDefs.map(f => {
                            if (f.type === "range") {
                                return (
                                    <View key={f.key} style={styles.filterSection}>
                                        <Text style={styles.filterLabel}>{i18n.t(f.translationKey)}</Text>
                                        <View style={styles.row}>
                                            <TextInput
                                                style={[styles.input, styles.halfInput, { marginBottom: 0 }]}
                                                placeholder={i18n.t('catlist_min')}
                                                keyboardType="numeric"
                                                placeholderTextColor={StyleSheet.flatten(styles.input).color === '#fff' ? '#888' : '#aaa'}
                                                value={advFilters.values[`${f.key}Min`] || ""}
                                                onChangeText={val => setAdvFilters(prev => ({ ...prev, values: { ...prev.values, [`${f.key}Min`]: val } }))}
                                            />
                                            <TextInput
                                                style={[styles.input, styles.halfInput, { marginBottom: 0 }]}
                                                placeholder={i18n.t('catlist_max')}
                                                keyboardType="numeric"
                                                placeholderTextColor={StyleSheet.flatten(styles.input).color === '#fff' ? '#888' : '#aaa'}
                                                value={advFilters.values[`${f.key}Max`] || ""}
                                                onChangeText={val => setAdvFilters(prev => ({ ...prev, values: { ...prev.values, [`${f.key}Max`]: val } }))}
                                            />
                                        </View>
                                    </View>
                                );
                            } else if (f.type === "select") {
                                return (
                                    <View key={f.key} style={styles.filterSection}>
                                        <Text style={styles.filterLabel}>{i18n.t(f.translationKey)}</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                            {(globalOptions[f.key] || []).map(opt => {
                                                const isActive = advFilters.values[f.key] === opt.toString();
                                                return (
                                                    <TouchableOpacity 
                                                        key={opt} 
                                                        style={[styles.chip, isActive && styles.activeChip]}
                                                        onPress={() => handleSelectFilter(f.key, opt.toString())}
                                                    >
                                                        <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                                                            {opt}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                );
                            }
                            return null;
                        })}
                    </ScrollView>

                    <TouchableOpacity 
                        style={styles.clearBtn} 
                        onPress={() => {
                            setSearchQuery('');
                            setSortBy('');
                            setAdvFilters({ minPrice: "", maxPrice: "", values: {} });
                        }}
                    >
                        <Text style={styles.clearBtnText}>{i18n.t('catlist_clear_filters')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* List Rendering */}
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={styles.center} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : processedParts.length === 0 ? (
                <Text style={styles.emptyText}>{i18n.t('catlist_no_parts')}</Text>
            ) : (
                <FlatList
                    data={processedParts}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    renderItem={renderPart}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}