import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ServerContext } from "../../context/server-context.js";
import { useStyles, useAppTheme } from "../../context/theme-context.js";
import { generateInventoryStyles } from "../../constants/InventoryStyle.js";

const CATEGORIES = ["CPU", "CPUCooler", "Motherboard", "Memory", "Storage", "VideoCard", "PowerSupply", "Case"];

const CATEGORY_PROPS = {
    CPU: [
        { name: "brand", type: "datalist", dynamicKey: "brands", label: "Brand", required: true },
        { name: "socket", type: "datalist", dynamicKey: "sockets", label: "Socket", required: true },
        { name: "supported_memory", type: "multi-select", dynamicKey: "memoryGens", options: ["DDR4", "DDR5"], label: "Memory Supported", required: true },
        { name: "has_apu", type: "select", options: ["true", "false"], label: "Has APU" },
        { name: "tdp", type: "number", label: "TDP (W)" },
        { name: "core_count", type: "number", label: "Core Count", required: true },
        { name: "core_clock", type: "number", label: "Core Clock (GHz)", required: true },
        { name: "boost_clock", type: "number", label: "Boost Clock (GHz)" },
    ],
    CPUCooler: [
        { name: "brand", type: "datalist", dynamicKey: "brands", label: "Brand", required: true },
        { name: "type", type: "select", options: ["Air", "Liquid"], label: "Type" },
        { name: "radiator_size", type: "datalist", dynamicKey: "radiatorSizes", label: "Radiator Size (mm) (0 if Air)" },
        { name: "supported_sockets", type: "multi-select", dynamicKey: "sockets", label: "Supported Sockets" },
        { name: "max_tdp_cooling", type: "number", label: "TDP Rating (W)" },
        { name: "height", type: "number", label: "Height (mm)" },
        { name: "noise_level", type: "number", label: "Noise Level (dB)" },
    ],
    Motherboard: [
        { name: "brand", type: "datalist", dynamicKey: "brands", label: "Brand", required: true },
        { name: "socket", type: "datalist", dynamicKey: "sockets", label: "Socket", required: true },
        { name: "form_factor", type: "datalist", dynamicKey: "moboFormFactors", label: "Form Factor", required: true },
        { name: "memory_gen", type: "datalist", dynamicKey: "memoryGens", label: "Memory Gen" },
        { name: "has_wifi_bluetooth", type: "select", options: ["true", "false"], label: "Has Bluetooth & WiFi" },
        { name: "memory_slots", type: "number", label: "Memory Slots", required: true },
        { name: "m2_slots", type: "number", label: "SSD NVMe Slots" },
        { name: "connections", type: "connection-builder", label: "Rear I/O Connections" },
        { name: "vrm_tier", type: "number", label: "VRM Tier (1-5)", required: true }
    ],
    Memory: [
        { name: "brand", type: "datalist", dynamicKey: "brands", label: "Brand", required: true },
        { name: "memory_gen", type: "datalist", dynamicKey: "memoryGens", label: "Memory Gen", required: true },
        { name: "speed_mhz", type: "number", label: "Speed (MHz)", required: true },
        { name: "cas_latency", type: "number", label: "CAS Latency", required: true },
        { name: "module_sticks", type: "number", label: "Stick Amount", required: true },
        { name: "module_capacity", type: "number", label: "Capacity Per Stick (GB)", required: true },
    ],
    Storage: [
        { name: "brand", type: "datalist", dynamicKey: "brands", label: "Brand", required: true },
        { name: "capacity", type: "number", label: "Capacity (GB)", required: true },
        { name: "drive_type", type: "datalist", dynamicKey: "driveTypes", label: "Drive Type" },
        { name: "form_factor", type: "datalist", dynamicKey: "storageFormFactors", label: "Form Factor" },
    ],
    PowerSupply: [
        { name: "brand", type: "datalist", dynamicKey: "brands", label: "Brand", required: true },
        { name: "wattage", type: "number", label: "Wattage (W)", required: true },
        { name: "efficiency", type: "select", options: ["80+ White", "80+ Bronze", "80+ Silver", "80+ Gold", "80+ Platinum", "80+ Titanium"], label: "Efficiency Rating" },
        { name: "type", type: "select", options: ["ATX", "SFX"], label: "Type" },
        { name: "modular", type: "select", options: ["Full", "Semi", "No"], label: "Modular" },
    ],
    VideoCard: [
        { name: "brand", type: "datalist", dynamicKey: "brands", label: "Brand", required: true },
        { name: "chipset", type: "datalist", dynamicKey: "gpuChipsets", label: "Chipset", required: true },
        { name: "memory", type: "number", label: "Memory (GB)" },
        { name: "tdp", type: "number", label: "TDP (W)" },
        { name: "length", type: "number", label: "Length (mm)" },
        { name: "core_clock", type: "number", label: "Core Clock (MHz)" },
        { name: "boost_clock", type: "number", label: "Boost Clock (MHz)" },
        { name: "slots_required", type: "number", label: "Slots Required" },
        { name: "recommended_psu_wattage", type: "number", label: "Recommended PSU Wattage (W)" },
    ],
    Case: [
        { name: "brand", type: "datalist", dynamicKey: "brands", label: "Brand", required: true },
        { name: "type", type: "datalist", dynamicKey: "moboFormFactors", label: "Type (e.g. Mid Tower)" },
        { name: "supported_mobo_form_factors", type: "multi-select", dynamicKey: "moboFormFactors", options: ["ATX", "Micro-ATX", "Mini-ITX", "E-ATX"], label: "Supported Motherboards", required: true },
        { name: "max_gpu_length", type: "number", label: "GPU Length (mm)", required: true },
        { name: "max_cpu_cooler_height", type: "number", label: "CPU Cooler Height (mm)", required: true },
        { name: "psu_form_factor", type: "select", options: ["ATX", "SFX"], label: "PSU Form Factor", required: true },
        { name: "supported_radiators", type: "multi-select", dynamicKey: "caseRadiators", options: [120, 240, 280, 360, 420], label: "Supported Radiators" },
        { name: "sidepanel_material", type: "text", label: "Side Panel Material" },
    ]
};

const COMMON_CONNECTIONS = [
    "USB-A 2.0", "USB-A 3.2 Gen 1 (5Gbps)", "USB-A 3.2 Gen 2 (10Gbps)",
    "USB-C 3.2 Gen 2 (10Gbps)", "USB-C 3.2 Gen 2x2 (20Gbps)", "Thunderbolt 4 / USB4",
    "RJ45 1GbE LAN", "RJ45 2.5GbE LAN", "RJ45 10GbE LAN",
    "Wi-Fi Antenna Ports", "HDMI", "DisplayPort",
    "Audio Jacks (3.5mm)", "Optical S/PDIF Out", "BIOS Flashback Button"
];

export default function InventoryScreen() {
    const { server, user } = useContext(ServerContext);
    const router = useRouter();
    const styles = useStyles(generateInventoryStyles);
    const { colors } = useAppTheme();

    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("CPU");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [modalCategory, setModalCategory] = useState("CPU");
    const [dbOptions, setDbOptions] = useState({});
    const [customInputs, setCustomInputs] = useState({});

    useEffect(() => {
        if (user?.isAdmin) {
            server.get('/options/form-options').then(res => setDbOptions(res.data)).catch(console.error);
        }
    }, [server, user]);

    useEffect(() => {
        setPage(1);
        fetchProducts(1, true);
    }, [category]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1);
            fetchProducts(1, true);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const fetchProducts = async (pageNum, reset = false) => {
        try {
            setLoading(true);
            const res = await server.get(`/products/inventory`, {
                params: { category, search, page: pageNum, limit: 10 }
            });
            const newProducts = res.data.products;
            setProducts(prev => reset ? newProducts : [...prev, ...newProducts]);
            setHasMore(pageNum < res.data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        let normalized = { ...item };
        if (item.category === "Memory") {
            normalized.memory_gen = item.speed?.[0] || "";
            normalized.speed_mhz = item.speed?.[1] || "";
            normalized.cas_latency = item.speed?.[2] || "";
            normalized.module_sticks = item.modules?.[0]?.toString() || "";
            normalized.module_capacity = item.modules?.[1]?.toString() || "";
        }
        setEditingItem(normalized);
        setFormData(normalized);
        setModalCategory(item.category || category || "CPU");
        setShowModal(true);
    };

    const handleDelete = (id) => {
        Alert.alert("Delete Item", "Are you sure you want to delete this product?", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive",
                onPress: async () => {
                    try {
                        await server.delete(`/products/${id}`);
                        setProducts(products.filter(p => p._id !== id));
                    } catch (err) {
                        Alert.alert("Error", "Failed to delete item.");
                    }
                }
            }
        ]);
    };

    const handleSave = async () => {
        try {
            const payload = { ...formData, category: modalCategory };
            
            // Reconstruct nested arrays for specific schemas before saving
            if (modalCategory === "Memory") {
                payload.speed = [formData.memory_gen, Number(formData.speed_mhz), Number(formData.cas_latency)];
                payload.modules = [Number(formData.module_sticks), Number(formData.module_capacity)];
            }
            if (modalCategory === "Case" && Array.isArray(payload.supported_radiators)) {
                payload.supported_radiators = payload.supported_radiators.map(Number).filter(n => !isNaN(n));
            }
            if (modalCategory === "Storage" && payload.drive_type) {
                payload.type = payload.drive_type;
            }

            if (editingItem && editingItem._id) {
                const res = await server.put(`/products/${editingItem._id}`, payload);
                setProducts(products.map(p => p._id === editingItem._id ? res.data : p));
            } else {
                const res = await server.post(`/products`, payload);
                if (category === modalCategory || !category) {
                    setProducts([res.data, ...products]);
                }
            }
            setShowModal(false);
        } catch (err) {
            Alert.alert("Save Failed", err.response?.data?.message || "Check required fields.");
        }
    };

    const toggleMultiSelect = (name, value) => {
        setFormData(prev => {
            let current = Array.isArray(prev[name]) ? prev[name] : 
                         (typeof prev[name] === 'string' ? prev[name].split(',').map(s=>s.trim()) : []);
            if (current.includes(value.toString())) {
                return { ...prev, [name]: current.filter(item => item !== value.toString()) };
            } else {
                return { ...prev, [name]: [...new Set([...current, value.toString()])] };
            }
        });
    };

    const updateConnection = (propName, type, count) => {
        setFormData(prev => {
            const currentArr = Array.isArray(prev[propName]) ? prev[propName] : [];
            const currentObj = {};
            currentArr.forEach(c => {
                const space = c.indexOf(' ');
                if (space > 0 && !isNaN(c.slice(0, space).trim())) {
                    currentObj[c.slice(space + 1).trim()] = c.slice(0, space).trim();
                } else {
                    currentObj[c.trim()] = "1";
                }
            });

            if (!count || count === '0') delete currentObj[type];
            else currentObj[type] = count;

            return { ...prev, [propName]: Object.entries(currentObj).map(([k, v]) => `${v} ${k}`) };
        });
    };

    // --- RENDER BLOCK FOR UNAUTHORIZED USERS ---
    if (!user || !user.isAdmin) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Access Denied</Text>
                <Text style={{color: colors.textGrey, marginTop: 10}}>Administrator privileges required.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header & Main Controls */}
            <View style={styles.header}>
                <Text style={styles.title}>Inventory Management</Text>
                <View style={styles.controlsRow}>
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search by name..."
                        placeholderTextColor={colors.textGrey}
                        value={search}
                        onChangeText={setSearch}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={() => {
                        setEditingItem(null);
                        setFormData({});
                        setModalCategory(category || "CPU");
                        setShowModal(true);
                    }}>
                        <Text style={styles.addBtnText}>+ Add Item</Text>
                    </TouchableOpacity>
                </View>

                {/* Horizontal Category Pill Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    <TouchableOpacity 
                        style={[styles.pill, category === "" && styles.pillActive]}
                        onPress={() => setCategory("")}
                    >
                        <Text style={[styles.pillText, category === "" && styles.pillTextActive]}>All</Text>
                    </TouchableOpacity>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity 
                            key={cat}
                            style={[styles.pill, { marginLeft: 8 }, category === cat && styles.pillActive]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* List of Products */}
            <FlatList
                data={products}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <View style={styles.productCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                            <Text style={styles.productPrice}>₪{item.price}</Text>
                        </View>
                        <Text style={[styles.stockText, { color: item.inStock ? colors.successGreen : colors.errorRed }]}>
                            {item.inStock ? "✓ In Stock" : "✗ Out of Stock"}
                        </Text>
                        <View style={styles.actionsRow}>
                            <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => handleEdit(item)}>
                                <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item._id)}>
                                <Text style={{ color: colors.errorRed, fontWeight: 'bold' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                onEndReached={() => { if (hasMore && !loading) fetchProducts(page + 1); }}
                onEndReachedThreshold={0.5}
            />

            {/* Modal for Adding/Editing */}
            <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={() => setShowModal(false)}>
                <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingItem ? "Edit Item" : "Add New Item"}</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* General Fields */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {CATEGORIES.map(cat => (
                                        <TouchableOpacity 
                                            key={cat} 
                                            style={[styles.pill, { marginRight: 8, opacity: editingItem ? 0.5 : 1 }, modalCategory === cat && styles.pillActive]}
                                            disabled={!!editingItem}
                                            onPress={() => { setModalCategory(cat); setFormData({}); }}
                                        >
                                            <Text style={[styles.pillText, modalCategory === cat && styles.pillTextActive]}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Name (Required)</Text>
                                <TextInput style={styles.input} value={formData.name || ""} onChangeText={t => setFormData(p => ({...p, name: t}))} />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Image URL</Text>
                                <TextInput style={styles.input} value={formData.image || ""} onChangeText={t => setFormData(p => ({...p, image: t}))} />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Price</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={formData.price?.toString() || ""} onChangeText={t => setFormData(p => ({...p, price: t}))} />
                            </View>
                            
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>In Stock Status</Text>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TouchableOpacity style={[styles.pill, formData.inStock !== false && styles.pillActive]} onPress={() => setFormData(p => ({...p, inStock: true}))}>
                                        <Text style={[styles.pillText, formData.inStock !== false && styles.pillTextActive]}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.pill, formData.inStock === false && styles.pillActive]} onPress={() => setFormData(p => ({...p, inStock: false}))}>
                                        <Text style={[styles.pillText, formData.inStock === false && styles.pillTextActive]}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Dynamic Category Properties */}
                            <View style={{ height: 1, backgroundColor: colors.borderColor, marginVertical: 20 }} />
                            <Text style={[styles.modalTitle, { marginBottom: 20 }]}>{modalCategory} Specs</Text>

                            {CATEGORY_PROPS[modalCategory]?.map((prop) => {
                                let availableOpts = prop.options ? [...prop.options] : [];
                                if (prop.dynamicKey && dbOptions[prop.dynamicKey]) {
                                    availableOpts = [...availableOpts, ...dbOptions[prop.dynamicKey]];
                                }

                                if (prop.type === "multi-select") {
                                    let currentSel = Array.isArray(formData[prop.name]) ? formData[prop.name].map(String) : 
                                                     (typeof formData[prop.name] === 'string' ? formData[prop.name].split(',').map(s=>s.trim()) : []);
                                    availableOpts = [...new Set([...availableOpts, ...currentSel].map(String))];

                                    return (
                                        <View key={prop.name} style={styles.formGroup}>
                                            <Text style={styles.label}>{prop.label}</Text>
                                            <View style={styles.pillContainer}>
                                                {availableOpts.map(opt => (
                                                    <TouchableOpacity key={opt} style={[styles.pill, currentSel.includes(opt) && styles.pillActive]} onPress={() => toggleMultiSelect(prop.name, opt)}>
                                                        <Text style={[styles.pillText, currentSel.includes(opt) && styles.pillTextActive]}>{opt}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                            <TextInput 
                                                style={[styles.input, { height: 40, marginTop: 5 }]} 
                                                placeholder="Add custom option..." 
                                                placeholderTextColor={colors.textGrey}
                                                value={customInputs[prop.name] || ""}
                                                onChangeText={t => setCustomInputs(p => ({...p, [prop.name]: t}))}
                                                onSubmitEditing={() => {
                                                    if (customInputs[prop.name]?.trim()) {
                                                        toggleMultiSelect(prop.name, customInputs[prop.name].trim());
                                                        setCustomInputs(p => ({...p, [prop.name]: ""}));
                                                    }
                                                }}
                                            />
                                        </View>
                                    );
                                }

                                if (prop.type === "connection-builder") {
                                    const currentObj = {};
                                    (Array.isArray(formData[prop.name]) ? formData[prop.name] : []).forEach(c => {
                                        const space = c.indexOf(' ');
                                        if (space > 0 && !isNaN(c.slice(0, space).trim())) currentObj[c.slice(space + 1).trim()] = c.slice(0, space).trim();
                                        else currentObj[c.trim()] = "1";
                                    });
                                    const allTypes = [...new Set([...COMMON_CONNECTIONS, ...Object.keys(currentObj)])];

                                    return (
                                        <View key={prop.name} style={styles.formGroup}>
                                            <Text style={styles.label}>{prop.label}</Text>
                                            {allTypes.map(conn => (
                                                <View key={conn} style={styles.connectionRow}>
                                                    <TextInput 
                                                        style={styles.connectionInput} 
                                                        keyboardType="numeric" 
                                                        placeholder="0"
                                                        placeholderTextColor={colors.textGrey}
                                                        value={currentObj[conn] || ""}
                                                        onChangeText={t => updateConnection(prop.name, conn, t)}
                                                    />
                                                    <Text style={styles.connectionLabel}>{conn}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    );
                                }

                                if (prop.type === "select" || prop.type === "datalist") {
                                    return (
                                        <View key={prop.name} style={styles.formGroup}>
                                            <Text style={styles.label}>{prop.label}</Text>
                                            <TextInput 
                                                style={styles.input} 
                                                value={formData[prop.name]?.toString() || ""} 
                                                onChangeText={t => {
                                                    let val = t;
                                                    if(t === "true") val = true; if(t === "false") val = false;
                                                    setFormData(p => ({...p, [prop.name]: val}));
                                                }}
                                            />
                                            {availableOpts.length > 0 && (
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                                                    {availableOpts.map(opt => (
                                                        <TouchableOpacity key={opt} style={[styles.pill, { marginRight: 8 }]} onPress={() => {
                                                            let val = opt; if(opt==="true") val=true; if(opt==="false") val=false;
                                                            setFormData(p => ({...p, [prop.name]: val}));
                                                        }}>
                                                            <Text style={styles.pillText}>{opt}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            )}
                                        </View>
                                    );
                                }

                                // Default Number/Text Input
                                return (
                                    <View key={prop.name} style={styles.formGroup}>
                                        <Text style={styles.label}>{prop.label}</Text>
                                        <TextInput 
                                            style={styles.input} 
                                            keyboardType={prop.type === "number" ? "numeric" : "default"}
                                            value={formData[prop.name]?.toString() || ""} 
                                            onChangeText={t => setFormData(p => ({...p, [prop.name]: t}))} 
                                        />
                                    </View>
                                );
                            })}

                            <View style={styles.modalActionRow}>
                                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowModal(false)}>
                                    <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSave}>
                                    <Text style={{ color: '#1C1C1E', fontWeight: 'bold', fontSize: 16 }}>Save Item</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}