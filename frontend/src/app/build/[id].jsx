import React, { useState, useEffect, useContext } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ServerContext } from "../../context/server-context";
import { useStyles, useAppTheme } from "../../context/theme-context";
import { generateSummaryStyles } from "../../constants/SummaryStyle";
import i18n from '../../localization/translation.js';

const hwList = [
    { schemaKey: "cpu", translationKey: "cat_cpu" },
    { schemaKey: "cpu_cooler", translationKey: "cat_cooler" },
    { schemaKey: "motherboard", translationKey: "cat_mobo" },
    { schemaKey: "ram", translationKey: "cat_ram" },
    { schemaKey: "storage", translationKey: "cat_storage" },
    { schemaKey: "power_supply", translationKey: "cat_psu" },
    { schemaKey: "gpu", translationKey: "cat_gpu" },
    { schemaKey: "case", translationKey: "cat_case" },
];

export default function BuildSummaryScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user, setUser, server } = useContext(ServerContext);
    
    const styles = useStyles(generateSummaryStyles);
    const { colors } = useAppTheme();

    const [build, setBuild] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Save Modal State
    const [isModalVisible, setModalVisible] = useState(false);
    const [buildName, setBuildName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchBuild = async () => {
            try {
                const res = await server.get(`/builds/${id}`);
                setBuild(res.data);
                setBuildName(`Build #${res.data.buildID}`);
            } catch {
                setError(i18n.t('sum_err_not_found'));
            } finally {
                setLoading(false);
            }
        };
        fetchBuild();
    }, [id, server]);

    if (loading) {
        return (
            <SafeAreaView style={styles.centerContent}>
                <ActivityIndicator size="large" color={colors.primaryAccent} />
            </SafeAreaView>
        );
    }

    if (error || !build) {
        return (
            <SafeAreaView style={styles.centerContent}>
                <MaterialCommunityIcons name="alert-circle-outline" size={60} color={colors.errorRed} style={{ marginBottom: 15 }} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primaryAccent, fontSize: 16 }}>{i18n.t('sum_btn_go_back')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const parts = hwList
        .filter(h => build[h.schemaKey])
        .map(h => ({ category: i18n.t(h.translationKey), ...build[h.schemaKey] }));

    const total = parts.reduce((sum, p) => sum + (p.price || 0), 0);

    const handleSaveToProfile = async () => {
        setSaving(true);
        try {
            const response = await server.post(`/users/${user.id}/save-build`, {
                buildRef: build._id,
                buildName: buildName
            });
            if (response.status === 200) {
                setUser(response.data.user);
                setModalVisible(false);
                Alert.alert(i18n.t('common_success'), i18n.t('sum_msg_saved'));
            }
        } catch (error) {
            Alert.alert(i18n.t('prof_alert_error'), error.response?.data?.message || i18n.t('sum_err_save'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.title}>{i18n.t('sum_title_build')}{build.buildID}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.listContainer}>
                {parts.map((p, i) => (
                    <View key={i} style={styles.partRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.categoryTag}>{p.category}</Text>
                            <Text style={styles.partName} numberOfLines={2}>{p.name}</Text>
                        </View>
                        <Text style={styles.partPrice}>₪{p.price}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{i18n.t('sum_lbl_total')}</Text>
                    <Text style={styles.totalValue}>₪{total}</Text>
                </View>
                
                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: colors.background }]} 
                        onPress={() => router.push(`/(tabs)/spec-builder?editBuildId=${build.buildID}`)}
                    >
                        <Text style={styles.actionBtnText}>{i18n.t('sum_btn_edit')}</Text>
                    </TouchableOpacity>

                    {user && (
                        <TouchableOpacity 
                            style={[styles.actionBtn, styles.saveProfileBtn]} 
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={[styles.actionBtnText, styles.saveProfileBtnText]}>{i18n.t('sum_btn_save_profile')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Custom Modal for Naming the Build before saving */}
            <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{i18n.t('sum_modal_title')}</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={buildName}
                            onChangeText={setBuildName}
                            placeholder={i18n.t('sum_modal_placeholder')}
                            placeholderTextColor={colors.textGrey}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalCancelBtn]} onPress={() => setModalVisible(false)}>
                                <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{i18n.t('spec_btn_cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalSaveBtn]} onPress={handleSaveToProfile} disabled={saving}>
                                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{i18n.t('common_save')}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}