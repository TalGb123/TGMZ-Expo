import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { ServerContext } from '../context/server-context.js';
import { useStyles } from '../context/theme-context.js';
import { useRouter } from 'expo-router';
import { generateCategoryListStyles } from '../constants/CategoryListStyle.js';

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
        { key: "brand", type: "select", label: "Brand" },
        { key: "socket", type: "select", label: "Socket" },
        { key: "supported_memory", type: "select", label: "Memory" },
        { key: "has_apu", type: "select", label: "Has APU" },
        { key: "tdp", type: "range", label: "TDP (W)" },
        { key: "core_clock", type: "range", label: "Clock (GHz)" },
    ],
    CPUCooler: [
        { key: "brand", type: "select", label: "Brand" },
        { key: "type", type: "select", label: "Type" },
        { key: "radiator_size", type: "select", label: "Radiator Size (mm)" },
        { key: "supported_sockets", type: "select", label: "Supported Sockets" },
        { key: "height", type: "range", label: "Height (mm)" },
    ],
    Motherboard: [
        { key: "brand", type: "select", label: "Brand" },
        { key: "socket", type: "select", label: "Socket" },
        { key: "form_factor", type: "select", label: "Form Factor" },
        { key: "memory_gen", type: "select", label: "Memory Generation" },
        { key: "has_wifi_bluetooth", type: "select", label: "Bluetooth & Wifi" },
    ],
    Memory: [
        { key: "brand", type: "select", label: "Brand" },
        { key: "ddrGen", type: "select", label: "DDR Generation" },
        { key: "speedMain", type: "select", label: "Speed (MHz)" },
        { key: "modulesLabel", type: "select", label: "Modules" },
        { key: "cas_latency", type: "range", label: "CAS Latency" },
    ],
    Storage: [
        { key: "brand", type: "select", label: "Brand" },
        { key: "capacity", type: "select", label: "Capacity (GB)" },
        { key: "drive_type", type: "select", label: "Type" },
        { key: "form_factor", type: "select", label: "Form Factor" },
    ],
    PowerSupply: [
        { key: "brand", type: "select", label: "Brand" },
        { key: "wattage", type: "range", label: "Wattage (W)" },
        { key: "efficiency", type: "select", label: "Efficiency" },
        { key: "type", type: "select", label: "Type" },
        { key: "modular", type: "select", label: "Modular" },
    ],
    VideoCard: [
        { key: "brand", type: "select", label: "Brand" },
        { key: "chipset", type: "select", label: "Chipset" },
        { key: "memory", type: "select", label: "Memory (GB)" },
        { key: "tdp", type: "range", label: "TDP (W)" },
        { key: "length", type: "range", label: "Length (mm)" },
    ],
    Case: [
        { key: "brand", type: "select", label: "Brand" },
        { key: "type", type: "select", label: "Type" },
        { key: "supported_mobo_form_factors", type: "select", label: "Mobo Sizes" },
        { key: "max_gpu_length", type: "range", label: "Max GPU Length (mm)" },
        { key: "psu_form_factor", type: "select", label: "PSU Form Factor" },
    ],
};

export default function CategoryList({ category, onSelect }) {
    const styles = useStyles(generateCategoryListStyles);
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
            setError("Could not load parts from server. Check your connection.");
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

    const renderPart = ({ item }) => (
        <View style={styles.card}>
            <Image 
                source={{ uri: item.image || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png" }} 
                style={styles.image} 
                resizeMode="contain"
            />
            <View style={styles.details}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>₪{item.price}</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity 
                        style={[styles.addBtn, { flex: 1, backgroundColor: '#6c757d' }]} 
                        onPress={() => router.push(`/product/${item._id}`)}
                    >
                        <Text style={styles.addBtnText}>View Details</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.addBtn, { flex: 1 }]} onPress={() => onSelect(item)}>
                        <Text style={styles.addBtnText}>Add to PC</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.filterToggleBtn} onPress={() => setShowFilters(!showFilters)}>
                <Text style={styles.filterToggleText}>
                    {showFilters ? "Hide Advanced Filters ⌃" : "Show Advanced Filters & Sorting ⌄"}
                </Text>
            </TouchableOpacity>

            {showFilters && (
                <View style={styles.filterPanel}>
                    {/* Basic Name & Price */}
                    <TextInput 
                        style={styles.input} 
                        placeholder="Search by name..." 
                        placeholderTextColor={StyleSheet.flatten(styles.input).color === '#fff' ? '#888' : '#aaa'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <View style={styles.row}>
                        <TextInput 
                            style={[styles.input, styles.halfInput]} 
                            placeholder="Min Price (₪)" 
                            placeholderTextColor={StyleSheet.flatten(styles.input).color === '#fff' ? '#888' : '#aaa'}
                            keyboardType="numeric"
                            value={advFilters.minPrice}
                            onChangeText={text => setAdvFilters(prev => ({ ...prev, minPrice: text }))}
                        />
                        <TextInput 
                            style={[styles.input, styles.halfInput]} 
                            placeholder="Max Price (₪)" 
                            placeholderTextColor={StyleSheet.flatten(styles.input).color === '#fff' ? '#888' : '#aaa'}
                            keyboardType="numeric"
                            value={advFilters.maxPrice}
                            onChangeText={text => setAdvFilters(prev => ({ ...prev, maxPrice: text }))}
                        />
                    </View>

                    {/* Sorting */}
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.sortBtn, sortBy === 'price-asc' && styles.activeSort]} onPress={() => setSortBy('price-asc')}>
                            <Text style={[styles.sortText, sortBy === 'price-asc' && styles.activeSortText]}>Price: Low to High</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.sortBtn, sortBy === 'price-desc' && styles.activeSort]} onPress={() => setSortBy('price-desc')}>
                            <Text style={[styles.sortText, sortBy === 'price-desc' && styles.activeSortText]}>Price: High to Low</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* DYNAMIC CATEGORY FILTERS */}
                    <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                        {filterDefs.map(f => {
                            if (f.type === "range") {
                                return (
                                    <View key={f.key} style={styles.filterSection}>
                                        <Text style={styles.filterLabel}>{f.label}</Text>
                                        <View style={styles.row}>
                                            <TextInput
                                                style={[styles.input, styles.halfInput, { marginBottom: 0 }]}
                                                placeholder="Min"
                                                keyboardType="numeric"
                                                placeholderTextColor={StyleSheet.flatten(styles.input).color === '#fff' ? '#888' : '#aaa'}
                                                value={advFilters.values[`${f.key}Min`] || ""}
                                                onChangeText={val => setAdvFilters(prev => ({ ...prev, values: { ...prev.values, [`${f.key}Min`]: val } }))}
                                            />
                                            <TextInput
                                                style={[styles.input, styles.halfInput, { marginBottom: 0 }]}
                                                placeholder="Max"
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
                                        <Text style={styles.filterLabel}>{f.label}</Text>
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
                        <Text style={styles.clearBtnText}>Clear All Filters</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* List Rendering */}
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={styles.center} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : parts.length === 0 ? (
                <Text style={styles.emptyText}>No parts found matching these filters.</Text>
            ) : (
                <FlatList
                    data={parts}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    renderItem={renderPart}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}