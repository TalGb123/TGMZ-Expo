import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { buildFilter } from "../utils/build-filter.js";
import { ServerContext } from "../context/server-context.js";
import { useStyles, useAppTheme } from "../context/theme-context.js";
import { generateQuestionnaireStyles } from '../constants/QuestionnaireStyle.js';
import i18n from '../localization/translation.js';

export default function Questionnaire({ onClose, onBuildGenerated }) {
    const { server } = useContext(ServerContext);
    const styles = useStyles(generateQuestionnaireStyles);
    const { colors } = useAppTheme();

    const [usage, setUsage] = useState([]);
    const [budget, setBudget] = useState("");
    const [needsWifi, setNeedsWifi] = useState(null);
    const [preferences, setPreferences] = useState([]);
    const [storage, setStorage] = useState(null);
    const [sizePreference, setSizePreference] = useState("No Preference");

    const [gameTypes, setGameTypes] = useState([]);
    const [resolution, setResolution] = useState(null);
    const [quality, setQuality] = useState(null);
    const [contentTypes, setContentTypes] = useState([]);
    const [aiTasks, setAiTasks] = useState([]);
    const [generalTask, setGeneralTask] = useState(null);

    const [dbColors, setDbColors] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await server.get('/options/form-options');
                if (res.data && res.data.colors) {
                    setDbColors(res.data.colors);
                }
            } catch (err) {
                console.error("Failed to fetch distinct colors from DB", err);
            }
        };
        fetchOptions();
    }, [server]);

    const toggleArray = (setter, option) => {
        setter(prev => prev.includes(option) ? prev.filter(i => i !== option) : [...prev, option]);
    };

    const handleGenerate = async () => {
        if (!budget) {
            Alert.alert(i18n.t('q_alert_budget_title'), i18n.t('q_alert_budget_msg'));
            return;
        }

        setIsGenerating(true);
        const rawAnswers = { usage, budget, needsWifi, preferences, gameTypes, resolution, quality, contentTypes, aiTasks, generalTask, storage, sizePreference };
        const strictFilters = buildFilter(rawAnswers, dbColors);
        
        try {
            const res = await server.post('/builds/generate', strictFilters);
            
            if (onBuildGenerated) {
                onBuildGenerated(res.data);
            }
       } catch (err) {
            console.error("Failed to generate build:", err);
            
            if (err.response && err.response.status >= 500) {
                Alert.alert(
                    i18n.t('q_alert_busy_title'), 
                    i18n.t('q_alert_busy_msg')
                );
            } else {
                Alert.alert(i18n.t('q_alert_err_title'), i18n.t('q_alert_err_msg'));
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const OptionChip = ({ label, isSelected, onPress }) => (
        <TouchableOpacity 
            style={[styles.chip, isSelected && styles.activeChip]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.chipText, isSelected && styles.activeChipText]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.introText}>
                {i18n.t('q_intro')}
            </Text>
            
            <View style={styles.stickyBudgetPanel}>
                <Text style={styles.questionLabel}>{i18n.t('q_lbl_budget')}</Text>
                <TextInput 
                    style={styles.budgetInput}
                    placeholder={i18n.t('q_ph_budget')}
                    placeholderTextColor={colors.textGrey}
                    keyboardType="numeric"
                    value={budget}
                    onChangeText={setBudget}
                />
            </View>

            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>{i18n.t('q_lbl_use')}</Text>
                    <View style={styles.chipGroup}>
                        {[
                            { val: "Gaming", t: "q_use_gaming" },
                            { val: "Content Creation", t: "q_use_content" },
                            { val: "Training AI Models", t: "q_use_ai" },
                            { val: "General Use", t: "q_use_general" }
                        ].map(opt => (
                            <OptionChip key={opt.val} label={i18n.t(opt.t)} isSelected={usage.includes(opt.val)} onPress={() => toggleArray(setUsage, opt.val)} />
                        ))}
                    </View>
                </View>

                {usage.includes("Gaming") && (
                    <View style={styles.subQuestionBlock}>
                        <Text style={styles.subQuestionLabel}>{i18n.t('q_lbl_game_types')}</Text>
                        <View style={styles.chipGroup}>
                            {[
                                { val: "Esports/Shooters", t: "q_game_esports" },
                                { val: "AAA/Heavy Story", t: "q_game_aaa" },
                                { val: "Indie/Casual", t: "q_game_indie" },
                                { val: "Simulators", t: "q_game_sims" }
                            ].map(opt => (
                                <OptionChip key={opt.val} label={i18n.t(opt.t)} isSelected={gameTypes.includes(opt.val)} onPress={() => toggleArray(setGameTypes, opt.val)} />
                            ))}
                        </View>

                        <Text style={styles.subQuestionLabel}>{i18n.t('q_lbl_resolution')}</Text>
                        <View style={styles.chipGroup}>
                            {[
                                { val: "1080p", t: "q_res_1080" },
                                { val: "1440p", t: "q_res_1440" },
                                { val: "4K", t: "q_res_4k" }
                            ].map(opt => (
                                <OptionChip key={opt.val} label={i18n.t(opt.t)} isSelected={resolution === opt.val} onPress={() => setResolution(opt.val)} />
                            ))}
                        </View>

                        <Text style={styles.subQuestionLabel}>{i18n.t('q_lbl_quality')}</Text>
                        <View style={styles.chipGroup}>
                            {[
                                { val: "Low/Competitive", t: "q_qual_low" },
                                { val: "Medium", t: "q_qual_med" },
                                { val: "High", t: "q_qual_high" },
                                { val: "Ultra", t: "q_qual_ultra" }
                            ].map(opt => (
                                <OptionChip key={opt.val} label={i18n.t(opt.t)} isSelected={quality === opt.val} onPress={() => setQuality(opt.val)} />
                            ))}
                        </View>
                    </View>
                )}

                {/* --- CONDITIONAL CONTENT CREATION SUB-QUESTIONS --- */}
                {usage.includes("Content Creation") && (
                    <View style={styles.subQuestionBlock}>
                        <Text style={styles.subQuestionLabel}>{i18n.t('q_lbl_content_type')}</Text>
                        <View style={styles.chipGroup}>
                            {[
                                { val: "Video Editing", t: "q_content_video" },
                                { val: "3D Rendering/Animation", t: "q_content_3d" },
                                { val: "Music Production", t: "q_content_music" },
                                { val: "Graphic Design/Photos", t: "q_content_graphic" }
                            ].map(opt => (
                                <OptionChip key={opt.val} label={i18n.t(opt.t)} isSelected={contentTypes.includes(opt.val)} onPress={() => toggleArray(setContentTypes, opt.val)} />
                            ))}
                        </View>
                    </View>
                )}

                {/* --- CONDITIONAL AI SUB-QUESTIONS --- */}
                {usage.includes("Training AI Models") && (
                    <View style={styles.subQuestionBlock}>
                        <Text style={styles.subQuestionLabel}>{i18n.t('q_lbl_ai_workloads')}</Text>
                        <View style={styles.chipGroup}>
                            {[
                                { val: "Large Language Models (LLMs)", t: "q_ai_llm" },
                                { val: "Image/Video Generation", t: "q_ai_image" },
                                { val: "Data Science/Machine Learning", t: "q_ai_data" }
                            ].map(opt => (
                                <OptionChip key={opt.val} label={i18n.t(opt.t)} isSelected={aiTasks.includes(opt.val)} onPress={() => toggleArray(setAiTasks, opt.val)} />
                            ))}
                        </View>
                    </View>
                )}

                {/* --- CONDITIONAL GENERAL USE SUB-QUESTIONS --- */}
                {usage.includes("General Use") && (
                    <View style={styles.subQuestionBlock}>
                        <Text style={styles.subQuestionLabel}>{i18n.t('q_lbl_general_intensity')}</Text>
                        <View style={styles.chipGroup}>
                            {[
                                { val: "Light (Web, Office, Movies)", t: "q_gen_light" },
                                { val: "Heavy Multitasking (Lots of tabs/apps)", t: "q_gen_heavy" }
                            ].map(opt => (
                                <OptionChip key={opt.val} label={i18n.t(opt.t)} isSelected={generalTask === opt.val} onPress={() => setGeneralTask(opt.val)} />
                            ))}
                        </View>
                    </View>
                )}

                {/* 3. STORAGE */}
                <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>{i18n.t('q_lbl_storage')}</Text>
                    <View style={styles.chipGroup}>
                        {[
                            { val: "500GB (Basic)", t: "q_store_500" },
                            { val: "1TB (Standard)", t: "q_store_1tb" },
                            { val: "2TB (Comfortable)", t: "q_store_2tb" },
                            { val: "4TB+ (Massive)", t: "q_store_4tb" }
                        ].map(opt => (
                            <OptionChip key={opt.val} label={i18n.t(opt.t)} isSelected={storage === opt.val} onPress={() => setStorage(opt.val)} />
                        ))}
                    </View>
                </View>
                
                {/* 4. Needs WIFI and Bluetooth Preference */}
                <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>{i18n.t('q_lbl_wifi')}</Text>
                    <View style={styles.chipGroup}>
                        <OptionChip 
                            label={i18n.t('common_yes')} 
                            isSelected={needsWifi === true} 
                            onPress={() => setNeedsWifi(true)} 
                        />
                        <OptionChip 
                            label={i18n.t('common_no')} 
                            isSelected={needsWifi === false} 
                            onPress={() => setNeedsWifi(false)} 
                        />
                    </View>
                </View>

                {/* 5. Physical Size Preference */}
                <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>{i18n.t('q_lbl_size')}</Text>
                    <View style={styles.chipGroup}>
                        {[
                            { val: "Compact (Mini-ITX)", t: "q_size_compact" },
                            { val: "Standard (Mid-Tower)", t: "q_size_standard" },
                            { val: "Large (Full-Tower)", t: "q_size_large" },
                            { val: "No Preference", t: "q_size_none" }
                        ].map(opt => (
                            <OptionChip 
                                key={opt.val} 
                                label={i18n.t(opt.t)} 
                                isSelected={sizePreference === opt.val} 
                                onPress={() => setSizePreference(opt.val)} 
                            />
                        ))}
                    </View>
                </View>        

                {/* 6. PREFERENCES */}
                <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>{i18n.t('q_lbl_prefs')}</Text>
                    <View style={styles.chipGroup}>
                        {[
                            { val: "Quiet PC", t: "q_pref_quiet" },
                            { val: "White PC Build", t: "q_pref_white" },
                            { val: "Black PC Build", t: "q_pref_black" },
                            { val: "RGB Needed", t: "q_pref_rgb" }
                        ].map(opt => (
                            <OptionChip key={opt.val} label={i18n.t(opt.t)} isSelected={preferences.includes(opt.val)} onPress={() => toggleArray(setPreferences, opt.val)} />
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* GENERATE BUTTON */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.generateBtn, isGenerating && { opacity: 0.7 }]} 
                    onPress={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.generateBtnText}>{i18n.t('q_btn_generate')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}