import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ServerContext } from "../../context/server-context.js";
import { useStyles, useAppTheme } from "../../context/theme-context.js";
import { generateInventoryStyles } from "../../constants/InventoryStyle.js";
import i18n from '../../localization/translation.js';

const CATEGORIES = ["CPU", "CPUCooler", "Motherboard", "Memory", "Storage", "VideoCard", "PowerSupply", "Case"];

const CATEGORY_PROPS = {
    CPU: [
        { name: "brand", type: "datalist", dynamicKey: "brands", translationKey: "inv_prop_brand", required: true },
        { name: "socket", type: "datalist", dynamicKey: "sockets", translationKey: "spec_socket", required: true },
        { name: "supported_memory", type: "multi-select", dynamicKey: "memoryGens", options: ["DDR4", "DDR5"], translationKey: "inv_prop_mem_supp", required: true },
        { name: "has_apu", type: "select", options: ["true", "false"], translationKey: "inv_prop_has_apu" },
        { name: "tdp", type: "number", translationKey: "inv_prop_tdp" },
        { name: "core_count", type: "number", translationKey: "spec_core_count", required: true },
        { name: "core_clock", type: "number", translationKey: "inv_prop_core_clock", required: true },
        { name: "boost_clock", type: "number", translationKey: "inv_prop_boost_clock" },
    ],
    CPUCooler: [
        { name: "brand", type: "datalist", dynamicKey: "brands", translationKey: "inv_prop_brand", required: true },
        { name: "type", type: "select", options: ["Air", "Liquid"], translationKey: "spec_type" },
        { name: "radiator_size", type: "datalist", dynamicKey: "radiatorSizes", translationKey: "inv_prop_rad_size" },
        { name: "supported_sockets", type: "multi-select", dynamicKey: "sockets", translationKey: "inv_prop_supp_sockets" },
        { name: "max_tdp_cooling", type: "number", translationKey: "inv_prop_tdp_rating" },
        { name: "height", type: "number", translationKey: "inv_prop_height" },
        { name: "noise_level", type: "number", translationKey: "inv_prop_noise" },
    ],
    Motherboard: [
        { name: "brand", type: "datalist", dynamicKey: "brands", translationKey: "inv_prop_brand", required: true },
        { name: "socket", type: "datalist", dynamicKey: "sockets", translationKey: "spec_socket", required: true },
        { name: "form_factor", type: "datalist", dynamicKey: "moboFormFactors", translationKey: "spec_form_factor", required: true },
        { name: "memory_gen", type: "datalist", dynamicKey: "memoryGens", translationKey: "spec_mem_gen" },
        { name: "has_wifi_bluetooth", type: "select", options: ["true", "false"], translationKey: "inv_prop_bt_wifi" },
        { name: "memory_slots", type: "number", translationKey: "spec_mem_slots", required: true },
        { name: "m2_slots", type: "number", translationKey: "inv_prop_m2_slots" },
        { name: "connections", type: "connection-builder", translationKey: "spec_rear_io" },
        { name: "vrm_tier", type: "number", translationKey: "inv_prop_vrm", required: true }
    ],
    Memory: [
        { name: "brand", type: "datalist", dynamicKey: "brands", translationKey: "inv_prop_brand", required: true },
        { name: "memory_gen", type: "datalist", dynamicKey: "memoryGens", translationKey: "spec_mem_gen", required: true },
        { name: "speed_mhz", type: "number", translationKey: "inv_prop_speed", required: true },
        { name: "cas_latency", type: "number", translationKey: "spec_cas", required: true },
        { name: "module_sticks", type: "number", translationKey: "inv_prop_stick_amt", required: true },
        { name: "module_capacity", type: "number", translationKey: "inv_prop_cap_per_stick", required: true },
    ],
    Storage: [
        { name: "brand", type: "datalist", dynamicKey: "brands", translationKey: "inv_prop_brand", required: true },
        { name: "capacity", type: "number", translationKey: "inv_prop_capacity", required: true },
        { name: "drive_type", type: "datalist", dynamicKey: "driveTypes", translationKey: "spec_drive_type" },
        { name: "form_factor", type: "datalist", dynamicKey: "storageFormFactors", translationKey: "spec_form_factor" },
    ],
    PowerSupply: [
        { name: "brand", type: "datalist", dynamicKey: "brands", translationKey: "inv_prop_brand", required: true },
        { name: "wattage", type: "number", translationKey: "inv_prop_wattage", required: true },
        { name: "efficiency", type: "select", options: ["80+ White", "80+ Bronze", "80+ Silver", "80+ Gold", "80+ Platinum", "80+ Titanium"], translationKey: "inv_prop_efficiency" },
        { name: "type", type: "select", options: ["ATX", "SFX"], translationKey: "spec_type" },
        { name: "modular", type: "select", options: ["Full", "Semi", "No"], translationKey: "spec_modular" },
    ],
    VideoCard: [
        { name: "brand", type: "datalist", dynamicKey: "brands", translationKey: "inv_prop_brand", required: true },
        { name: "chipset", type: "datalist", dynamicKey: "gpuChipsets", translationKey: "spec_chipset", required: true },
        { name: "memory", type: "number", translationKey: "inv_prop_memory_gb" },
        { name: "tdp", type: "number", translationKey: "inv_prop_tdp" },
        { name: "length", type: "number", translationKey: "inv_prop_length" },
        { name: "core_clock", type: "number", translationKey: "inv_prop_core_clock_mhz" },
        { name: "boost_clock", type: "number", translationKey: "inv_prop_boost_clock_mhz" },
        { name: "slots_required", type: "number", translationKey: "spec_slots_req" },
        { name: "recommended_psu_wattage", type: "number", translationKey: "inv_prop_rec_psu" },
    ],
    Case: [
        { name: "brand", type: "datalist", dynamicKey: "brands", translationKey: "inv_prop_brand", required: true },
        { name: "type", type: "datalist", dynamicKey: "moboFormFactors", translationKey: "inv_prop_case_type" },
        { name: "supported_mobo_form_factors", type: "multi-select", dynamicKey: "moboFormFactors", options: ["ATX", "Micro-ATX", "Mini-ITX", "E-ATX"], translationKey: "inv_prop_supp_mobos", required: true },
        { name: "max_gpu_length", type: "number", translationKey: "inv_prop_gpu_len", required: true },
        { name: "max_cpu_cooler_height", type: "number", translationKey: "inv_prop_cooler_height", required: true },
        { name: "psu_form_factor", type: "select", options: ["ATX", "SFX"], translationKey: "spec_psu_form", required: true },
        { name: "supported_radiators", type: "multi-select", dynamicKey: "caseRadiators", options: [120, 240, 280, 360, 420], translationKey: "spec_rad_support" },
        { name: "sidepanel_material", type: "text", translationKey: "spec_side_panel" },
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
        Alert.alert(i18n.t('inv_del_title'), i18n.t('inv_del_msg'), [
            { text: i18n.t('spec_btn_cancel'), style: "cancel" },
            { 
                text: i18n.t('inventory_delete'), 
                style: "destructive",
                onPress: async () => {
                    try {
                        await server.delete(`/products/${id}`);
                        setProducts(products.filter(p => p._id !== id));
                    } catch (err) {
                        Alert.alert(i18n.t('prof_alert_error'), i18n.t('inv_err_del'));
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
            Alert.alert(i18n.t('inv_err_save'), err.response?.data?.message || i18n.t('inv_err_save_msg'));
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
                <Text style={styles.errorText}>{i18n.t('inv_access_denied')}</Text>
                <Text style={{color: colors.textGrey, marginTop: 10}}>{i18n.t('inv_admin_req')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header & Main Controls */}
            <View style={styles.header}>
                <Text style={styles.title}>{i18n.t('inventory_title')}</Text>
                <View style={styles.controlsRow}>
                    <TextInput 
                        style={styles.searchInput}
                        placeholder={i18n.t('inventory_search')}
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
                        <Text style={styles.addBtnText}>{i18n.t('inventory_add_item')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Horizontal Category Pill Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    <TouchableOpacity 
                        style={[styles.pill, category === "" && styles.pillActive]}
                        onPress={() => setCategory("")}
                    >
                        <Text style={[styles.pillText, category === "" && styles.pillTextActive]}>{i18n.t('inv_cat_all')}</Text>
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
                            {item.inStock ? i18n.t('prod_in_stock') : i18n.t('prod_out_stock')}
                        </Text>
                        <View style={styles.actionsRow}>
                            <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => handleEdit(item)}>
                                <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{i18n.t('inventory_edit')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item._id)}>
                                <Text style={{ color: colors.errorRed, fontWeight: 'bold' }}>{i18n.t('inventory_delete')}</Text>
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
                            <Text style={styles.modalTitle}>{editingItem ? i18n.t('inv_modal_edit') : i18n.t('inv_modal_add')}</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Text style={styles.closeText}>{i18n.t('spec_btn_close')}</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* General Fields */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{i18n.t('inv_lbl_category')}</Text>
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
                                <Text style={styles.label}>{i18n.t('inv_lbl_name_req')}</Text>
                                <TextInput style={styles.input} value={formData.name || ""} onChangeText={t => setFormData(p => ({...p, name: t}))} />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{i18n.t('inv_lbl_image')}</Text>
                                <TextInput style={styles.input} value={formData.image || ""} onChangeText={t => setFormData(p => ({...p, image: t}))} />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{i18n.t('inv_lbl_price')}</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={formData.price?.toString() || ""} onChangeText={t => setFormData(p => ({...p, price: t}))} />
                            </View>
                            
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{i18n.t('inv_lbl_stock_status')}</Text>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TouchableOpacity style={[styles.pill, formData.inStock !== false && styles.pillActive]} onPress={() => setFormData(p => ({...p, inStock: true}))}>
                                        <Text style={[styles.pillText, formData.inStock !== false && styles.pillTextActive]}>{i18n.t('common_yes')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.pill, formData.inStock === false && styles.pillActive]} onPress={() => setFormData(p => ({...p, inStock: false}))}>
                                        <Text style={[styles.pillText, formData.inStock === false && styles.pillTextActive]}>{i18n.t('common_no')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Dynamic Category Properties */}
                            <View style={{ height: 1, backgroundColor: colors.borderColor, marginVertical: 20 }} />
                            <Text style={[styles.modalTitle, { marginBottom: 20 }]}>{modalCategory}{i18n.t('inv_lbl_specs')}</Text>

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
                                            <Text style={styles.label}>{i18n.t(prop.translationKey)}</Text>
                                            <View style={styles.pillContainer}>
                                                {availableOpts.map(opt => (
                                                    <TouchableOpacity key={opt} style={[styles.pill, currentSel.includes(opt) && styles.pillActive]} onPress={() => toggleMultiSelect(prop.name, opt)}>
                                                        <Text style={[styles.pillText, currentSel.includes(opt) && styles.pillTextActive]}>{opt}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                            <TextInput 
                                                style={[styles.input, { height: 40, marginTop: 5 }]} 
                                                placeholder={i18n.t('inv_placeholder_custom')} 
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
                                            <Text style={styles.label}>{i18n.t(prop.translationKey)}</Text>
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
                                            <Text style={styles.label}>{i18n.t(prop.translationKey)}</Text>
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
                                        <Text style={styles.label}>{i18n.t(prop.translationKey)}</Text>
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
                                    <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{i18n.t('spec_btn_cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSave}>
                                    <Text style={{ color: '#1C1C1E', fontWeight: 'bold', fontSize: 16 }}>{i18n.t('inv_btn_save')}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}