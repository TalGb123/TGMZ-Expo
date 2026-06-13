import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Modal } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from "expo-router";
import CategoryList from "../../components/category-list";
import Questionnaire from "../../components/questionnaire"; 
import { ServerContext } from "../../components/server-context";
import { useStyles, useAppTheme } from "../../components/theme-context";

const hwList = [
    { id: 1, name: "CPU", dbName: "CPU", schemaKey: "cpu" },
    { id: 2, name: "CPU Cooler", dbName: "CPUCooler", schemaKey: "cpu_cooler" },
    { id: 3, name: "Motherboard", dbName: "Motherboard", schemaKey: "motherboard" },
    { id: 4, name: "RAM", dbName: "Memory", schemaKey: "ram" },
    { id: 5, name: "Storage", dbName: "Storage", schemaKey: "storage" },
    { id: 6, name: "Power Supply", dbName: "PowerSupply", schemaKey: "psu" },
    { id: 7, name: "GPU", dbName: "VideoCard", schemaKey: "gpu" },
    { id: 8, name: "Case", dbName: "Case", schemaKey: "case" }
];

export default function SpecBuilderScreen() {
    const { server } = useContext(ServerContext);
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const styles = useStyles(generateStyles);
    const { colors, isLandscape } = useAppTheme();

    const [activeCategory, setActiveCategory] = useState(null);
    const [selections, setSelections] = useState({});
    const [searchId, setSearchId] = useState("");
    const [msg, setMsg] = useState("");
    const [isQuestionnaireActive, setIsQuestionnaireActive] = useState(false);

    useEffect(() => {
        const editId = params.editBuildId;
        if (!editId) return;

        const loadBuild = async () => {
            try {
                const res = await server.get(`/builds/${editId}`);
                const buildData = res.data;
                const newSelections = {};
                hwList.forEach(item => {
                    if (buildData[item.schemaKey]) {
                        newSelections[item.id] = buildData[item.schemaKey];
                    }
                });
                setSelections(newSelections);
                setMsg("✅ Build Loaded Successfully!");
            } catch (err) {
                console.error(err);
                setMsg("❌ Error loading build.");
            }
        };
        loadBuild();
    }, [params.editBuildId, server]);

    const handleSelect = (part) => {
        setSelections(prev => ({ ...prev, [activeCategory]: part }));
        setActiveCategory(null);
    };

    const handleGeneratedBuild = (generatedData) => {
        const parts = generatedData.selectedParts;
        if (!parts) {
            setMsg("❌ Error: No parts found in the generated build.");
            return;
        }

        const newSelections = {};
        hwList.forEach(item => {
            if (parts[item.schemaKey]) {
                newSelections[item.id] = parts[item.schemaKey];
            }
        });

        setSelections(newSelections);
        setMsg("✅ Auto-build loaded successfully!");
        setIsQuestionnaireActive(false);
    };

    const handleSave = async () => {
        if (Object.keys(selections).length === 0) {
            setMsg("❌ Cannot save an empty build.");
            return;
        }

        setMsg("Saving...");
        const payload = {};
        hwList.forEach(item => {
            if (selections[item.id]) {
                payload[item.schemaKey] = selections[item.id];
            }
        });
        
        try {
            const res = await server.post('/builds', payload);
            setMsg(`✅ Saved! Build ID: ${res.data.id}`);
            router.push(`/build/${res.data.id}`); 
        } catch (err) {
            console.error(err);
            setMsg("❌ Error saving build.");
        }
    };

    const handleSearch = () => {
        const cleanId = searchId.trim();
        if (!cleanId) {
            setMsg("⚠️ Please enter a Build ID.");
            return;
        }
        setMsg("Loading...");
        router.setParams({ editBuildId: cleanId }); 
    };

    const handleClear = (id) => {
        setSelections(prev => {
            const newSelections = { ...prev };
            delete newSelections[id];
            return newSelections;
        });
    };

    const totalPrice = Object.values(selections).reduce((sum, item) => sum + (item.price || 0), 0);
    const activeCategoryName = hwList.find(c => c.id === activeCategory)?.name;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>PC Spec Builder</Text>
                
                <View style={styles.searchRow}>
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Enter Build ID..."
                        placeholderTextColor={colors.textGrey}
                        value={searchId}
                        onChangeText={setSearchId}
                    />
                    <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                        <Text style={styles.searchBtnText}>Load</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.questionnaireBtn} 
                    onPress={() => setIsQuestionnaireActive(true)}
                >
                    <Text style={styles.questionnaireBtnText}>Open Smart Questionnaire</Text>
                </TouchableOpacity>

                {msg ? (
                    <Text style={[styles.feedbackMsg, msg.includes("✅") ? { color: colors.successGreen } : { color: colors.errorRed }]}>
                        {msg}
                    </Text>
                ) : null}
            </View>

            <ScrollView contentContainerStyle={styles.gridContainer}>
                {hwList.map(item => {
                    const selected = selections[item.id];
                    return (
                        <View key={item.id} style={styles.card}>
                            <Text style={styles.cardHeader}>{item.name}</Text>
                            <View style={styles.cardBody}>
                                {selected ? (
                                    <>
                                        <Image 
                                            source={{ uri: selected.image || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png" }} 
                                            style={styles.partImage} 
                                            resizeMode="contain"
                                        />
                                        <View style={styles.partDetails}>
                                            <Text style={styles.partName} numberOfLines={2}>{selected.name}</Text>
                                            <Text style={styles.partPrice}>₪{selected.price}</Text>
                                        </View>
                                    </>
                                ) : (
                                    <Text style={styles.placeholderText}>None Selected</Text>
                                )}
                            </View>
                            <View style={styles.cardFooter}>
                                <TouchableOpacity style={styles.chooseBtn} onPress={() => setActiveCategory(item.id)}>
                                    <Text style={styles.chooseBtnText}>{selected ? "Change" : "Choose"}</Text>
                                </TouchableOpacity>
                                {selected && (
                                    <TouchableOpacity style={styles.clearBtn} onPress={() => handleClear(item.id)}>
                                        <Text style={styles.clearBtnText}>Clear</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.totalText}>Total: ₪{totalPrice}</Text>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>💾 Save This Build</Text>
                </TouchableOpacity>
            </View>

            <Modal 
                visible={!!activeCategory} 
                animationType="slide" 
                transparent={true}
                onRequestClose={() => setActiveCategory(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose {activeCategoryName}</Text>
                            <TouchableOpacity onPress={() => setActiveCategory(null)}>
                                <Text style={styles.closeModalText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <CategoryList 
                            category={hwList.find(c => c.id === activeCategory)?.dbName}
                            onSelect={handleSelect} 
                            selections={selections}
                        />
                    </View>
                </View>
            </Modal>

            <Modal 
                visible={isQuestionnaireActive} 
                animationType="slide" 
                transparent={true}
                onRequestClose={() => setIsQuestionnaireActive(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Smart Questionnaire</Text>
                            <TouchableOpacity onPress={() => setIsQuestionnaireActive(false)}>
                                <Text style={styles.closeModalText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {isQuestionnaireActive && (
                            <Questionnaire 
                                onClose={() => setIsQuestionnaireActive(false)}
                                onBuildGenerated={handleGeneratedBuild} 
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const generateStyles = (colors, isLandscape) => ({
    container: { flex: 1, backgroundColor: colors.background },
    
    header: { 
        padding: 20, 
        backgroundColor: colors.cardBackground, 
        borderBottomWidth: 1, 
        borderColor: colors.borderColor 
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: colors.textMain, 
        marginBottom: 15 
    },
    searchRow: { 
        flexDirection: 'row', 
        gap: 10, 
        marginBottom: 10 
    },
    searchInput: { 
        flex: 1, 
        borderWidth: 1, 
        borderColor: colors.borderColor, 
        borderRadius: 8, 
        padding: 10, 
        color: colors.textMain,
        backgroundColor: colors.background
    },
    searchBtn: { 
        backgroundColor: colors.primaryAccent, 
        paddingHorizontal: 20, 
        justifyContent: 'center', 
        borderRadius: 8 
    },
    searchBtnText: { color: '#fff', fontWeight: 'bold' },
    questionnaireBtn: { 
        backgroundColor: colors.textGrey, 
        padding: 12, 
        borderRadius: 8, 
        alignItems: 'center', 
        marginTop: 5 
    },
    questionnaireBtnText: { color: '#fff', fontWeight: 'bold' },
    feedbackMsg: { 
        marginTop: 10, 
        textAlign: 'center', 
        fontWeight: 'bold' 
    },
    
    gridContainer: { 
        padding: 15, 
        paddingBottom: 30 
    },
    card: { 
        backgroundColor: colors.cardBackground, 
        borderRadius: 12, 
        marginBottom: 15, 
        padding: 15, 
        borderWidth: 1, 
        borderColor: colors.borderColor, 
        elevation: 2 
    },
    cardHeader: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: colors.textMain, 
        borderBottomWidth: 1, 
        borderColor: colors.borderColor, 
        paddingBottom: 10, 
        marginBottom: 10 
    },
    cardBody: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        minHeight: 60, 
        gap: 15 
    },
    partImage: { width: 50, height: 50 },
    partDetails: { flex: 1 },
    partName: { 
        fontSize: 14, 
        color: colors.textMain, 
        fontWeight: '500' 
    },
    partPrice: { 
        fontSize: 16, 
        color: colors.primaryAccent, 
        fontWeight: 'bold', 
        marginTop: 4 
    },
    placeholderText: { 
        color: colors.textGrey, 
        fontStyle: 'italic', 
        flex: 1, 
        textAlign: 'center' 
    },
    cardFooter: { 
        flexDirection: 'row', 
        gap: 10, 
        marginTop: 15 
    },
    chooseBtn: { 
        flex: 1, 
        backgroundColor: colors.primaryAccent, 
        padding: 10, 
        borderRadius: 6, 
        alignItems: 'center' 
    },
    chooseBtnText: { color: '#fff', fontWeight: 'bold' },
    clearBtn: { 
        backgroundColor: colors.errorRed, 
        padding: 10, 
        borderRadius: 6, 
        alignItems: 'center', 
        paddingHorizontal: 20 
    },
    clearBtnText: { color: '#fff', fontWeight: 'bold' },

    footer: { 
        padding: 20, 
        backgroundColor: colors.cardBackground, 
        borderTopWidth: 1, 
        borderColor: colors.borderColor 
    },
    totalText: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: colors.textMain, 
        textAlign: 'center', 
        marginBottom: 15 
    },
    saveBtn: { 
        backgroundColor: colors.successGreen || '#28a745', 
        padding: 15, 
        borderRadius: 8, 
        alignItems: 'center' 
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'flex-end' 
    },
    modalContent: { 
        backgroundColor: colors.background, 
        height: '85%', 
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20, 
        padding: 20 
    },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    modalTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: colors.textMain 
    },
    closeModalText: { 
        color: colors.errorRed, 
        fontSize: 16, 
        fontWeight: 'bold' 
    }
});