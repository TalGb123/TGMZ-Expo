import React, { useState, useEffect, useContext } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ServerContext } from "../../context/server-context";
import { useStyles, useAppTheme } from "../../context/theme-context";
import { generateSummaryStyles } from "../../constants/SummaryStyle";

const hwList = [
    { schemaKey: "cpu", name: "CPU" },
    { schemaKey: "cpu_cooler", name: "CPU Cooler" },
    { schemaKey: "motherboard", name: "Motherboard" },
    { schemaKey: "ram", name: "RAM" },
    { schemaKey: "storage", name: "Storage" },
    { schemaKey: "power_supply", name: "Power Supply" },
    { schemaKey: "gpu", name: "GPU" },
    { schemaKey: "case", name: "Case" },
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
                setError("Build not found or invalid ID.");
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
                    <Text style={{ color: colors.primaryAccent, fontSize: 16 }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const parts = hwList
        .filter(h => build[h.schemaKey])
        .map(h => ({ category: h.name, ...build[h.schemaKey] }));

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
                Alert.alert("Success", "Build saved to your profile!");
            }
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Failed to save build.");
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
                <Text style={styles.title}>Build #{build.buildID}</Text>
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
                    <Text style={styles.totalLabel}>Total Estimated Cost:</Text>
                    <Text style={styles.totalValue}>₪{total}</Text>
                </View>
                
                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: colors.background }]} 
                        onPress={() => router.push(`/(tabs)/spec-builder?editBuildId=${build.buildID}`)}
                    >
                        <Text style={styles.actionBtnText}>Edit Build</Text>
                    </TouchableOpacity>

                    {user && (
                        <TouchableOpacity 
                            style={[styles.actionBtn, styles.saveProfileBtn]} 
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={[styles.actionBtnText, styles.saveProfileBtnText]}>💾 Save to Profile</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Custom Modal for Naming the Build before saving */}
            <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Save Build to Profile</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={buildName}
                            onChangeText={setBuildName}
                            placeholder="Enter a name for this build"
                            placeholderTextColor={colors.textGrey}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalCancelBtn]} onPress={() => setModalVisible(false)}>
                                <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalSaveBtn]} onPress={handleSaveToProfile} disabled={saving}>
                                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}