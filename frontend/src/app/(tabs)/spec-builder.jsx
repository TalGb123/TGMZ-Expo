import React, { useState, useContext, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Modal } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import CategoryList from "../../components/category-list.jsx";
import Questionnaire from "../../components/questionnaire.jsx"; 
import { ServerContext } from "../../context/server-context.js";
import { useStyles, useAppTheme } from "../../context/theme-context.js";
import { generateSpecBuilderStyles } from "../../constants/SpecBuilderStyle.js";
import i18n from '../../localization/translation.js';

const hwList = [
    { id: 1, translationKey: "cat_cpu", dbName: "CPU", schemaKey: "cpu" },
    { id: 2, translationKey: "cat_cooler", dbName: "CPUCooler", schemaKey: "cpu_cooler" },
    { id: 3, translationKey: "cat_mobo", dbName: "Motherboard", schemaKey: "motherboard" },
    { id: 4, translationKey: "cat_ram", dbName: "Memory", schemaKey: "ram" },
    { id: 5, translationKey: "cat_storage", dbName: "Storage", schemaKey: "storage" },
    { id: 6, translationKey: "cat_psu", dbName: "PowerSupply", schemaKey: "power_supply" },
    { id: 7, translationKey: "cat_gpu", dbName: "VideoCard", schemaKey: "gpu" },
    { id: 8, translationKey: "cat_case", dbName: "Case", schemaKey: "case" }
];

export default function SpecBuilderScreen() {
    const { server, user } = useContext(ServerContext);
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const styles = useStyles(generateSpecBuilderStyles);
    const { colors } = useAppTheme();

    const [activeCategory, setActiveCategory] = useState(null);
    const [selections, setSelections] = useState({});
    const [msg, setMsg] = useState("");
    
    const [isQuestionnaireActive, setIsQuestionnaireActive] = useState(false);
    const [isLoadModalOpen, setLoadModalOpen] = useState(false);
    const [searchId, setSearchId] = useState("");

    const [buildReasoning, setBuildReasoning] = useState("");
    const [isReasoningModalOpen, setIsReasoningModalOpen] = useState(false);
    
    const [hasChanges, setHasChanges] = useState(false);
    const [footerMsg, setFooterMsg] = useState("");

    useFocusEffect(
        useCallback(() => {
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
                    setBuildReasoning("");
                    setHasChanges(false);
                    setMsg(i18n.t('spec_msg_load_success'));
                    
                    // Consume the ID so tab-switching doesn't wipe current progress
                    router.setParams({ editBuildId: "" });
                    
                } catch (err) {
                    console.error(err);
                    setMsg(i18n.t('spec_msg_load_error'));
                }
            };
            loadBuild();
        }, [params.editBuildId, server])
    );

    const handleSelect = (part) => {
        setSelections(prev => ({ ...prev, [activeCategory]: part }));
        setActiveCategory(null);
        setHasChanges(true);
    };

    const handleGeneratedBuild = (generatedData) => {
        const parts = generatedData.selectedParts;
        if (!parts) {
            setMsg(i18n.t('spec_msg_gen_error_empty'));
            return;
        }

        const newSelections = {};
        hwList.forEach(item => {
            if (parts[item.schemaKey]) {
                newSelections[item.id] = parts[item.schemaKey];
            }
        });

        setSelections(newSelections);
        setBuildReasoning(generatedData.reasoning || "");
        setHasChanges(true);
        setMsg(i18n.t('spec_msg_gen_success'));
        setIsQuestionnaireActive(false);
    };

    const handleSave = async () => {
        if (Object.keys(selections).length === 0) return;

        setMsg(i18n.t('spec_msg_saving'));
        const payload = {};
        hwList.forEach(item => {
            if (selections[item.id]) {
                payload[item.schemaKey] = selections[item.id];
            }
        });
        
        try {
            const res = await server.post('/builds', payload);
            setMsg(i18n.t('spec_msg_saved'));
            setHasChanges(false);
            router.push(`/build/${res.data.id}`); 
        } catch (err) {
            console.error(err);
            setMsg(i18n.t('spec_msg_save_error'));
        }
    };

    const handleSearch = () => {
        const cleanId = searchId.trim();
        if (!cleanId) {
            setMsg(i18n.t('spec_msg_err_empty_id'));
            setLoadModalOpen(false);
            return;
        }
        setMsg(i18n.t('spec_msg_loading'));
        router.setParams({ editBuildId: cleanId }); 
        setLoadModalOpen(false);
        setSearchId(""); 
    };

    const handleClear = (id) => {
        setSelections(prev => {
            const newSelections = { ...prev };
            delete newSelections[id];
            return newSelections;
        });
        setHasChanges(true);
    };

    const totalPrice = Object.values(selections).reduce((sum, item) => sum + (item.price || 0), 0);
    const activeCategoryName = hwList.find(c => c.id === activeCategory)?.name;
    const canSave = hasChanges && Object.keys(selections).length > 0;

    return (
        <SafeAreaView style={styles.container}>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                
                <View style={styles.header}>
                    
                    <View style={styles.headerActionsRow}>
                        <TouchableOpacity 
                            style={[styles.headerBtn, { backgroundColor: colors.primaryAccent }]} 
                            onPress={() => setLoadModalOpen(true)}
                        >
                            <Text style={[styles.headerBtnText, { color: '#1C1C1E' }]}>{i18n.t('spec_btn_load_existing')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.headerBtn, { backgroundColor: colors.textGrey }]} 
                            onPress={() => setIsQuestionnaireActive(true)}
                        >
                            <Text style={styles.headerBtnText}>{i18n.t('spec_btn_smart_q')}</Text>
                        </TouchableOpacity>
                    </View>

                    {msg ? (
                        <Text style={[styles.feedbackMsg, msg.includes("✅") ? { color: colors.successGreen } : { color: colors.errorRed }]}>
                            {msg}
                        </Text>
                    ) : null}
                </View>

                {/* MAIN LIST */}
                <View style={styles.gridContainer}>
                    {hwList.map(item => {
                        const selected = selections[item.id];
                        return (
                            <View key={item.id} style={styles.card}>
                                <Text style={styles.cardHeader}>{i18n.t(item.translationKey)}</Text>
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
                                        <Text style={styles.placeholderText}>{i18n.t('spec_lbl_none_selected')}</Text>
                                    )}
                                </View>
                                <View style={styles.cardFooter}>
                                    <TouchableOpacity style={styles.chooseBtn} onPress={() => setActiveCategory(item.id)}>
                                        <Text style={styles.chooseBtnText}>{selected ? i18n.t('spec_btn_change') : i18n.t('spec_btn_choose')}</Text>
                                    </TouchableOpacity>
                                    {selected && (
                                        <TouchableOpacity style={styles.clearBtn} onPress={() => handleClear(item.id)}>
                                            <Text style={styles.clearBtnText}>{i18n.t('spec_btn_clear')}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.totalText}>{i18n.t('spec_lbl_total')}{totalPrice}</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    
                    <TouchableOpacity 
                        style={[
                            styles.saveBtn, 
                            { flex: 1 },
                            (!canSave || !user) && { backgroundColor: colors.borderColor, opacity: 0.8 }
                        ]} 
                        onPress={() => {
                            if (!user) {
                                setFooterMsg(i18n.t('spec_msg_login_save'));
                                setTimeout(() => setFooterMsg(""), 3500);
                            } else if (canSave) {
                                handleSave();
                            }
                        }}
                        activeOpacity={(!canSave && user) ? 1 : 0.2}
                    >
                        <Text style={[styles.saveBtnText, (!canSave || !user) && { color: colors.textGrey }]}>{i18n.t('spec_btn_save_build')}</Text>
                    </TouchableOpacity>

                    {buildReasoning ? (
                        <TouchableOpacity 
                            style={[styles.saveBtn, { flex: 1, backgroundColor: colors.primaryAccent }]} 
                            onPress={() => setIsReasoningModalOpen(true)}
                        >
                            <Text style={[styles.saveBtnText, { color: '#fff' }]}>{i18n.t('spec_btn_ai_reasoning')}</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
                {footerMsg ? <Text style={styles.footerMsg}>{footerMsg}</Text> : null}
            </View>

            {/* --- MODALS --- */}

            <Modal visible={!!activeCategory} animationType="slide" transparent={true} onRequestClose={() => setActiveCategory(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{i18n.t('spec_title_choose')}{activeCategoryName}</Text>
                            <TouchableOpacity onPress={() => setActiveCategory(null)}>
                                <Text style={styles.closeModalText}>{i18n.t('spec_btn_close')}</Text>
                            </TouchableOpacity>
                        </View>
                        <CategoryList category={hwList.find(c => c.id === activeCategory)?.dbName} onSelect={handleSelect} selections={selections} />
                    </View>
                </View>
            </Modal>

            <Modal visible={isQuestionnaireActive} animationType="slide" transparent={true} onRequestClose={() => setIsQuestionnaireActive(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{i18n.t('spec_btn_smart_q')}</Text>
                            <TouchableOpacity onPress={() => setIsQuestionnaireActive(false)}>
                                <Text style={styles.closeModalText}>{i18n.t('spec_btn_close')}</Text>
                            </TouchableOpacity>
                        </View>
                        {isQuestionnaireActive && <Questionnaire onClose={() => setIsQuestionnaireActive(false)} onBuildGenerated={handleGeneratedBuild} />}
                    </View>
                </View>
            </Modal>

            <Modal visible={isReasoningModalOpen} animationType="fade" transparent={true} onRequestClose={() => setIsReasoningModalOpen(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '60%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{i18n.t('spec_title_ai_reasoning')}</Text>
                            <TouchableOpacity onPress={() => setIsReasoningModalOpen(false)}>
                                <Text style={styles.closeModalText}>{i18n.t('spec_btn_close')}</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={{ fontSize: 16, color: colors.textMain, lineHeight: 24 }}>{buildReasoning}</Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={isLoadModalOpen} transparent animationType="fade" onRequestClose={() => setLoadModalOpen(false)}>
                <View style={[styles.modalOverlay, { justifyContent: 'center', padding: 20 }]}>
                    <View style={styles.smallModalContent}>
                        <Text style={styles.modalTitle}>{i18n.t('spec_title_load_build')}</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder={i18n.t('spec_placeholder_build_id')}
                            placeholderTextColor={colors.textGrey}
                            value={searchId}
                            onChangeText={setSearchId}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalCancelBtn]} onPress={() => setLoadModalOpen(false)}>
                                <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{i18n.t('spec_btn_cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalSubmitBtn]} onPress={handleSearch}>
                                <Text style={{ color: '#1C1C1E', fontWeight: 'bold' }}>{i18n.t('spec_btn_load')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}