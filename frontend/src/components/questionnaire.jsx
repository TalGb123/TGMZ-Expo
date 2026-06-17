import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { buildFilter } from "../utils/build-filter.js";
import { ServerContext } from "../context/server-context.js";
import { useStyles, useAppTheme } from "../context/theme-context.js";
import { generateQuestionnaireStyles } from '../constants/QuestionnaireStyle.js';

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
            Alert.alert("Missing Budget", "Please enter a maximum budget for your build.");
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
                    "AI Servers Busy 🚦", 
                    "Our AI builder is currently experiencing extremely high demand. Please wait about 30 seconds and try clicking generate again!"
                );
            } else {
                Alert.alert("Error", "Failed to generate build. Please check your connection and try again.");
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
                Welcome! Answer a few questions and our AI will build the perfect PC for your needs.
            </Text>
            
            <View style={styles.stickyBudgetPanel}>
                <Text style={styles.questionLabel}>1. Max budget (₪)?</Text>
                <TextInput 
                    style={styles.budgetInput}
                    placeholder="e.g. 5000" 
                    placeholderTextColor={colors.textGrey}
                    keyboardType="numeric"
                    value={budget}
                    onChangeText={setBudget}
                />
            </View>

            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>2. Primary use? (Select multiple)</Text>
                    <View style={styles.chipGroup}>
                        {["Gaming", "Content Creation", "Training AI Models", "General Use"].map(opt => (
                            <OptionChip key={opt} label={opt} isSelected={usage.includes(opt)} onPress={() => toggleArray(setUsage, opt)} />
                        ))}
                    </View>
                </View>

                {usage.includes("Gaming") && (
                    <View style={styles.subQuestionBlock}>
                        <Text style={styles.subQuestionLabel}>↳ Game types?</Text>
                        <View style={styles.chipGroup}>
                            {["Esports/Shooters", "AAA/Heavy Story", "Indie/Casual", "Simulators"].map(opt => (
                                <OptionChip key={opt} label={opt} isSelected={gameTypes.includes(opt)} onPress={() => toggleArray(setGameTypes, opt)} />
                            ))}
                        </View>

                        <Text style={styles.subQuestionLabel}>↳ Target Resolution?</Text>
                        <View style={styles.chipGroup}>
                            {["1080p", "1440p", "4K"].map(opt => (
                                <OptionChip key={opt} label={opt} isSelected={resolution === opt} onPress={() => setResolution(opt)} />
                            ))}
                        </View>

                        <Text style={styles.subQuestionLabel}>↳ Quality Settings?</Text>
                        <View style={styles.chipGroup}>
                            {["Low/Competitive", "Medium", "High", "Ultra"].map(opt => (
                                <OptionChip key={opt} label={opt} isSelected={quality === opt} onPress={() => setQuality(opt)} />
                            ))}
                        </View>
                    </View>
                )}

                {/* --- CONDITIONAL CONTENT CREATION SUB-QUESTIONS --- */}
                {usage.includes("Content Creation") && (
                    <View style={styles.subQuestionBlock}>
                        <Text style={styles.subQuestionLabel}>↳ Content type?</Text>
                        <View style={styles.chipGroup}>
                            {["Video Editing", "3D Rendering/Animation", "Music Production", "Graphic Design/Photos"].map(opt => (
                                <OptionChip key={opt} label={opt} isSelected={contentTypes.includes(opt)} onPress={() => toggleArray(setContentTypes, opt)} />
                            ))}
                        </View>
                    </View>
                )}

                {/* --- CONDITIONAL AI SUB-QUESTIONS --- */}
                {usage.includes("Training AI Models") && (
                    <View style={styles.subQuestionBlock}>
                        <Text style={styles.subQuestionLabel}>↳ AI Workloads?</Text>
                        <View style={styles.chipGroup}>
                            {["Large Language Models (LLMs)", "Image/Video Generation", "Data Science/Machine Learning"].map(opt => (
                                <OptionChip key={opt} label={opt} isSelected={aiTasks.includes(opt)} onPress={() => toggleArray(setAiTasks, opt)} />
                            ))}
                        </View>
                    </View>
                )}

                {/* --- CONDITIONAL GENERAL USE SUB-QUESTIONS --- */}
                {usage.includes("General Use") && (
                    <View style={styles.subQuestionBlock}>
                        <Text style={styles.subQuestionLabel}>↳ Daily intensity?</Text>
                        <View style={styles.chipGroup}>
                            {["Light (Web, Office, Movies)", "Heavy Multitasking (Lots of tabs/apps)"].map(opt => (
                                <OptionChip key={opt} label={opt} isSelected={generalTask === opt} onPress={() => setGeneralTask(opt)} />
                            ))}
                        </View>
                    </View>
                )}

                {/* 3. STORAGE */}
                <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>3. Storage space needed?</Text>
                    <View style={styles.chipGroup}>
                        {["500GB (Basic)", "1TB (Standard)", "2TB (Comfortable)", "4TB+ (Massive)"].map(opt => (
                            <OptionChip key={opt} label={opt} isSelected={storage === opt} onPress={() => setStorage(opt)} />
                        ))}
                    </View>
                </View>
                
                {/* 4. Needs WIFI and Bluetooth Preference */}
                <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>4. Case size preference?</Text>
                    <View style={styles.chipGroup}>
                        <OptionChip 
                            label="Yes" 
                            isSelected={needsWifi === true} 
                            onPress={() => setNeedsWifi(true)} 
                        />
                        <OptionChip 
                            label="No" 
                            isSelected={needsWifi === false} 
                            onPress={() => setNeedsWifi(false)} 
                        />
                    </View>
                </View>

                {/* 4. Physical Size Preference */}
                <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>4. Case size preference?</Text>
                    <View style={styles.chipGroup}>
                        {["Compact (Mini-ITX)", "Standard (Mid-Tower)", "Large (Full-Tower)", "No Preference"].map(opt => (
                            <OptionChip 
                                key={opt} 
                                label={opt} 
                                isSelected={sizePreference === opt} 
                                onPress={() => setSizePreference(opt)} 
                            />
                        ))}
                    </View>
                </View>        

                {/* 5. PREFERENCES */}
                <View style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>5. Specific preferences?</Text>
                    <View style={styles.chipGroup}>
                        {["Quiet PC", "White PC Build", "Black PC Build", "RGB Needed"].map(opt => (
                            <OptionChip key={opt} label={opt} isSelected={preferences.includes(opt)} onPress={() => toggleArray(setPreferences, opt)} />
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
                        <Text style={styles.generateBtnText}>✨ Generate Smart Build</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}