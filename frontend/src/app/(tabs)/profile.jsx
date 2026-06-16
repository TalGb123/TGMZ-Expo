import React, { useState, useEffect, useContext } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, ScrollView, 
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, 
    Keyboard, ActivityIndicator, Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ServerContext } from '../../context/server-context';
import { useStyles, useAppTheme } from '../../context/theme-context';
import { generateProfileStyles } from './ProfileStyle';
// Reusable Input Component for the Profile Form
const ProfileInput = ({ label, value, onChangeText, placeholder, keyboardType, disabled, security, onToggleSecurity, colors, styles, errorMessage }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputWrapper, disabled && { backgroundColor: colors.background }, errorMessage && { borderColor: colors.errorRed }]}>
            <TextInput
                style={[styles.input, disabled && { color: colors.textGrey }]}
                placeholder={placeholder}
                placeholderTextColor={colors.textGrey}
                value={value}
                onChangeText={onChangeText}
                editable={!disabled}
                keyboardType={keyboardType}
                secureTextEntry={security}
                autoCapitalize="none"
            />
            {onToggleSecurity && (
                <TouchableOpacity onPress={onToggleSecurity}>
                    <MaterialCommunityIcons name={security ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textGrey} />
                </TouchableOpacity>
            )}
        </View>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
);

// Individual Build Card Component
const SavedBuildCard = ({ savedBuild, server, user, setUser, colors, styles, router }) => {
    const [expanded, setExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(savedBuild.buildName);
    const buildData = savedBuild.buildRef;

    if (!buildData) return null;

    const handleRename = async () => {
        try {
            const res = await server.patch(`/users/${user.id}/rename-build`, {
                buildRef: buildData._id,
                newName: editName
            });
            setUser(res.data.user);
            setIsEditing(false);
        } catch (error) {
            Alert.alert("Error", "Failed to rename build");
        }
    };

    const handleDelete = () => {
        Alert.alert("Delete Build", "Remove this build from your profile?", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive",
                onPress: async () => {
                    try {
                        const res = await server.delete(`/users/${user.id}/remove-build/${buildData._id}`);
                        setUser(res.data.user);
                    } catch (error) {
                        Alert.alert("Error", "Failed to remove build");
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.buildCard}>
            <View style={styles.buildCardHeader}>
                {isEditing ? (
                    <View style={styles.renameContainer}>
                        <TextInput 
                            style={styles.renameInput}
                            value={editName}
                            onChangeText={setEditName}
                            autoFocus
                        />
                        <TouchableOpacity onPress={handleRename} style={styles.actionIcon}>
                            <MaterialCommunityIcons name="check-circle" size={24} color={colors.successGreen} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.actionIcon}>
                            <MaterialCommunityIcons name="close-circle" size={24} color={colors.errorRed} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.buildTitleRow} onPress={() => setExpanded(!expanded)}>
                        <Text style={styles.buildTitle}>{savedBuild.buildName}</Text>
                        <MaterialCommunityIcons name={expanded ? "chevron-up" : "chevron-down"} size={24} color={colors.textGrey} />
                    </TouchableOpacity>
                )}
            </View>

            {expanded && (
                <View style={styles.buildContent}>
                    <Text style={styles.buildDate}>Saved on: {new Date(savedBuild.savedAt).toLocaleDateString()}</Text>
                    <Text style={styles.buildId}>ID: #{buildData.buildID}</Text>
                    
                    <View style={styles.partsList}>
                        {[
                            { key: 'cpu', label: 'CPU' },
                            { key: 'cpu_cooler', label: 'Cooler' },
                            { key: 'motherboard', label: 'Motherboard' },
                            { key: 'ram', label: 'RAM' },
                            { key: 'storage', label: 'Storage' },
                            { key: 'gpu', label: 'GPU' },
                            { key: 'power_supply', label: 'PSU' },
                            { key: 'case', label: 'Case' }
                        ].map(hw => buildData[hw.key] ? (
                            <View key={hw.key} style={styles.partRow}>
                                <Text style={styles.partLabel}>{hw.label}:</Text>
                                <Text style={styles.partValue} numberOfLines={1} ellipsizeMode="tail">{buildData[hw.key].name}</Text>
                            </View>
                        ) : null)}
                    </View>

                    <View style={styles.buildActions}>
                        <TouchableOpacity style={[styles.buildBtn, { backgroundColor: colors.primaryAccent }]} onPress={() => router.push('/(tabs)/spec-builder')}>
                            <Text style={styles.buildBtnText}>View / Load</Text>
                        </TouchableOpacity>
                        {!isEditing && (
                            <TouchableOpacity style={[styles.buildBtn, { backgroundColor: colors.background }]} onPress={() => setIsEditing(true)}>
                                <Text style={[styles.buildBtnText, { color: colors.textMain }]}>Rename</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.buildBtn, { backgroundColor: colors.errorRed + '20' }]} onPress={handleDelete}>
                            <Text style={[styles.buildBtnText, { color: colors.errorRed }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

export default function ProfileScreen() {
    const { user, setUser, server } = useContext(ServerContext);
    const router = useRouter();
    
    const styles = useStyles(generateProfileStyles);
    const { isLandscape, colors } = useAppTheme();

    const [activeTab, setActiveTab] = useState('info'); 
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [formData, setFormData] = useState({
        id: '', name: '', email: '', phone: '', birthday: '', password: ''
    });
    const [errors, setErrors] = useState({});

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 18);

    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id || '',
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                birthday: user.birthday || '',
                password: user.password || ''
            });
        }
    }, [user]);

    // Guest Interception
    if (!user) {
        return (
            <View style={styles.guestContainer}>
                <MaterialCommunityIcons name="account-off-outline" size={80} color={colors.textGrey} style={{marginBottom: 20}} />
                <Text style={styles.guestTitle}>Guest Mode</Text>
                <Text style={styles.guestSubtitle}>You must be logged in to view your profile and saved builds.</Text>
                <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace('/(auth)/login')}>
                    <Text style={styles.loginBtnText}>Go to Login / Register</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/^[a-zA-Z0-9._%+-]+@(walla|gmail)\.(com|co\.il)$/.test(formData.email)) {
            newErrors.email = "Must be a Gmail or Walla address";
        }

        if (!formData.phone) {
            newErrors.phone = "Phone is required";
        } else {
            const cleanPhone = formData.phone.replace(/-/g, "");
            if (!/^05\d{8}$/.test(cleanPhone)) newErrors.phone = "Must start with 05 and contain 10 digits";
        }

        if (formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(formData.password)) {
            newErrors.password = "8+ chars, uppercase, lowercase, number & symbol";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdateProfile = async () => {
        setStatusMsg({ text: "", type: "" });
        if (!validateForm()) return;

        setLoading(true);
        const updates = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            birthday: formData.birthday,
            password: formData.password
        };

        try {
            const response = await server.patch(`/users/${user.id}`, updates);
            if (response.status === 200) {
                setStatusMsg({ text: "Profile updated successfully!", type: "success" });
                setUser({ ...user, ...updates });
            }
        } catch (error) {
            setStatusMsg({ text: error.response?.data?.message || "Failed to update profile", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const renderInfoForm = () => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Personal Information</Text>
            <ProfileInput label="ID (Cannot be changed)" value={formData.id} disabled colors={colors} styles={styles} />
            <ProfileInput label="Full Name" value={formData.name} onChangeText={(text) => setFormData({...formData, name: text})} errorMessage={errors.name} colors={colors} styles={styles} />
            <ProfileInput label="Email Address" value={formData.email} onChangeText={(text) => setFormData({...formData, email: text})} keyboardType="email-address" errorMessage={errors.email} colors={colors} styles={styles} />
            <ProfileInput label="Phone Number" value={formData.phone} onChangeText={(text) => setFormData({...formData, phone: text})} keyboardType="phone-pad" errorMessage={errors.phone} colors={colors} styles={styles} />
            
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Birthday</Text>
                <TouchableOpacity style={[styles.inputWrapper, { paddingVertical: 12 }]} onPress={() => setShowDatePicker(true)}>
                    <Text style={{ color: formData.birthday ? colors.textMain : colors.textGrey }}>
                        {formData.birthday ? new Date(formData.birthday).toLocaleDateString() : 'Select Date'}
                    </Text>
                </TouchableOpacity>
                {(Platform.OS === 'ios' || showDatePicker) && (
                    <DateTimePicker 
                        value={formData.birthday ? new Date(formData.birthday) : maxDate} 
                        maximumDate={maxDate} 
                        display="default"
                        onChange={(e, date) => {
                            if (Platform.OS !== 'ios') setShowDatePicker(false);
                            if (date) setFormData({...formData, birthday: date.toISOString().split('T')[0]});
                        }}
                    />
                )}
            </View>

            <ProfileInput label="Password" value={formData.password} onChangeText={(text) => setFormData({...formData, password: text})} security={!showPassword} onToggleSecurity={() => setShowPassword(!showPassword)} errorMessage={errors.password} colors={colors} styles={styles} />

            {statusMsg.text ? (
                <Text style={[styles.statusMsg, { color: statusMsg.type === 'success' ? colors.successGreen : colors.errorRed }]}>{statusMsg.text}</Text>
            ) : null}

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
        </View>
    );

    const renderBuilds = () => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Saved Builds</Text>
            {user.savedBuilds && user.savedBuilds.length > 0 ? (
                user.savedBuilds.map((savedBuild, index) => (
                    savedBuild.buildRef ? (
                        <SavedBuildCard key={index} savedBuild={savedBuild} server={server} user={user} setUser={setUser} colors={colors} styles={styles} router={router} />
                    ) : null
                ))
            ) : (
                <Text style={styles.emptyText}>You haven't saved any builds yet.</Text>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.mainContainer}>
                    {/* Portrait Layout: Segmented Control Tabs */}
                    {!isLandscape && (
                        <View style={styles.segmentContainer}>
                            <TouchableOpacity style={[styles.segmentBtn, activeTab === 'info' && styles.segmentBtnActive]} onPress={() => setActiveTab('info')}>
                                <Text style={[styles.segmentText, activeTab === 'info' && styles.segmentTextActive]}>My Info</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.segmentBtn, activeTab === 'builds' && styles.segmentBtnActive]} onPress={() => setActiveTab('builds')}>
                                <Text style={[styles.segmentText, activeTab === 'builds' && styles.segmentTextActive]}>Saved Builds</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {isLandscape ? (
                            // Landscape Layout: Split Screen
                            <View style={styles.landscapeRow}>
                                <View style={styles.landscapeCol}>{renderInfoForm()}</View>
                                <View style={styles.landscapeCol}>{renderBuilds()}</View>
                            </View>
                        ) : (
                            activeTab === 'info' ? renderInfoForm() : renderBuilds()
                        )}
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}