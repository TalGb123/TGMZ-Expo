import React, { useState, useEffect, useContext } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, ScrollView, 
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, 
    Keyboard, ActivityIndicator, Alert, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ServerContext } from '../../context/server-context';
import { useStyles, useAppTheme } from '../../context/theme-context';
import { generateProfileStyles } from '../../constants/ProfileStyle';
import i18n from '../../localization/translation.js';
import * as ImagePicker from 'expo-image-picker';

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
            Alert.alert(i18n.t('prof_alert_error'), i18n.t('prof_err_rename'));
        }
    };

    const handleDelete = () => {
        Alert.alert(i18n.t('prof_del_title'), i18n.t('prof_del_msg'), [
            { text: i18n.t('spec_btn_cancel'), style: "cancel" },
            { 
                text: i18n.t('prof_btn_delete'), 
                style: "destructive",
                onPress: async () => {
                    try {
                        const res = await server.delete(`/users/${user.id}/remove-build/${buildData._id}`);
                        setUser(res.data.user);
                    } catch (error) {
                        Alert.alert(i18n.t('prof_alert_error'), i18n.t('prof_err_remove'));
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
                    <Text style={styles.buildDate}>{i18n.t('prof_saved_on')}{new Date(savedBuild.savedAt).toLocaleDateString()}</Text>
                    <Text style={styles.buildId}>{i18n.t('prof_build_id')}{buildData.buildID}</Text>
                    
                    <View style={styles.partsList}>
                        {[
                            { key: 'cpu', label: i18n.t('cat_cpu') },
                            { key: 'cpu_cooler', label: i18n.t('cat_cooler') },
                            { key: 'motherboard', label: i18n.t('cat_mobo') },
                            { key: 'ram', label: i18n.t('cat_ram') },
                            { key: 'storage', label: i18n.t('cat_storage') },
                            { key: 'gpu', label: i18n.t('cat_gpu') },
                            { key: 'power_supply', label: i18n.t('cat_psu') },
                            { key: 'case', label: i18n.t('cat_case') }
                        ].map(hw => buildData[hw.key] ? (
                            <View key={hw.key} style={styles.partRow}>
                                <Text style={styles.partLabel}>{hw.label}:</Text>
                                <Text style={styles.partValue} numberOfLines={1} ellipsizeMode="tail">{buildData[hw.key].name}</Text>
                            </View>
                        ) : null)}
                    </View>

                    <View style={styles.buildActions}>
                        <TouchableOpacity style={[styles.buildBtn, { backgroundColor: colors.primaryAccent }]} onPress={() => router.push('/(tabs)/spec-builder')}>
                            <Text style={styles.buildBtnText}>{i18n.t('prof_btn_view')}</Text>
                        </TouchableOpacity>
                        {!isEditing && (
                            <TouchableOpacity style={[styles.buildBtn, { backgroundColor: colors.background }]} onPress={() => setIsEditing(true)}>
                                <Text style={[styles.buildBtnText, { color: colors.textMain }]}>{i18n.t('prof_btn_rename')}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.buildBtn, { backgroundColor: colors.errorRed + '20' }]} onPress={handleDelete}>
                            <Text style={[styles.buildBtnText, { color: colors.errorRed }]}>{i18n.t('prof_btn_delete')}</Text>
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
        id: '', name: '', email: '', phone: '', birthday: '', password: '', avatar: ''
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
                password: user.password || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    if (!user) {
        return (
            <View style={styles.guestContainer}>
                <MaterialCommunityIcons name="account-off-outline" size={80} color={colors.textGrey} style={{marginBottom: 20}} />
                <Text style={styles.guestTitle}>{i18n.t('prof_guest_title')}</Text>
                <Text style={styles.guestSubtitle}>{i18n.t('prof_guest_subtitle')}</Text>
                <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace('/(auth)/login')}>
                    <Text style={styles.loginBtnText}>{i18n.t('prof_guest_btn')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = i18n.t('prof_err_name_req');
        
        if (!formData.email) {
            newErrors.email = i18n.t('prof_err_email_req');
        } else if (!/^[a-zA-Z0-9._%+-]+@(walla|gmail)\.(com|co\.il)$/.test(formData.email)) {
            newErrors.email = i18n.t('reg_err_email');
        }

        if (!formData.phone) {
            newErrors.phone = i18n.t('prof_err_phone_req');
        } else {
            const cleanPhone = formData.phone.replace(/-/g, "");
            if (!/^05\d{8}$/.test(cleanPhone)) newErrors.phone = i18n.t('reg_err_phone');
        }

        if (formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(formData.password)) {
            newErrors.password = i18n.t('reg_err_pass');
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
            password: formData.password,
            avatar: formData.avatar
        };

        try {
            const response = await server.patch(`/users/${user.id}`, updates);
            if (response.status === 200) {
                setStatusMsg({ text: i18n.t('prof_msg_success'), type: "success" });
                setUser({ ...user, ...updates });
            }
        } catch (error) {
            setStatusMsg({ text: error.response?.data?.message || i18n.t('prof_msg_fail'), type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async (mode) => {
        let result;
        const options = {
            mediaTypes: ['images'], 
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3, 
            base64: true, 
        };

        if (mode === 'camera') {
            await ImagePicker.requestCameraPermissionsAsync();
            result = await ImagePicker.launchCameraAsync(options);
        } else {
            await ImagePicker.requestMediaLibraryPermissionsAsync();
            result = await ImagePicker.launchImageLibraryAsync(options);
        }

        if (!result.canceled) {
            setFormData({...formData, avatar: `data:image/jpeg;base64,${result.assets[0].base64}`});
        }
    };

    const handleImageChoice = () => {
        Alert.alert(
            "Profile Picture",
            "Choose an option",
            [
                { text: "Take Photo", onPress: () => pickImage('camera') },
                { text: "Choose from Gallery", onPress: () => pickImage('gallery') },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const renderInfoForm = () => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>{i18n.t('prof_sec_personal')}</Text>

            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={handleImageChoice}>
                    {formData.avatar ? (
                        <Image 
                            source={{ uri: formData.avatar }} 
                            style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: colors.primaryAccent }} 
                        />
                    ) : (
                        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.primaryAccent }}>
                            <MaterialCommunityIcons name="camera-plus" size={40} color={colors.primaryAccent} />
                        </View>
                    )}
                </TouchableOpacity>
                <Text style={{ marginTop: 8, color: colors.textGrey, fontSize: 12 }}>Tap to change picture</Text>
            </View>

            <ProfileInput label={i18n.t('prof_lbl_id_fixed')} value={formData.id} disabled colors={colors} styles={styles} />
            <ProfileInput label={i18n.t('prof_lbl_name')} value={formData.name} onChangeText={(text) => setFormData({...formData, name: text})} errorMessage={errors.name} colors={colors} styles={styles} />
            <ProfileInput label={i18n.t('prof_lbl_email')} value={formData.email} onChangeText={(text) => setFormData({...formData, email: text})} keyboardType="email-address" errorMessage={errors.email} colors={colors} styles={styles} />
            <ProfileInput label={i18n.t('prof_lbl_phone')} value={formData.phone} onChangeText={(text) => setFormData({...formData, phone: text})} keyboardType="phone-pad" errorMessage={errors.phone} colors={colors} styles={styles} />
            
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{i18n.t('prof_lbl_birthday')}</Text>
                <TouchableOpacity style={[styles.inputWrapper, { paddingVertical: 12 }]} onPress={() => setShowDatePicker(true)}>
                    <Text style={{ color: formData.birthday ? colors.textMain : colors.textGrey }}>
                        {formData.birthday ? new Date(formData.birthday).toLocaleDateString() : i18n.t('prof_lbl_select_date')}
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

            <ProfileInput label={i18n.t('prof_lbl_password')} value={formData.password} onChangeText={(text) => setFormData({...formData, password: text})} security={!showPassword} onToggleSecurity={() => setShowPassword(!showPassword)} errorMessage={errors.password} colors={colors} styles={styles} />

            {statusMsg.text ? (
                <Text style={[styles.statusMsg, { color: statusMsg.type === 'success' ? colors.successGreen : colors.errorRed }]}>{statusMsg.text}</Text>
            ) : null}

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>{i18n.t('prof_btn_save')}</Text>}
            </TouchableOpacity>
        </View>
    );

    const renderBuilds = () => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>{i18n.t('prof_sec_builds')}</Text>
            {user.savedBuilds && user.savedBuilds.length > 0 ? (
                user.savedBuilds.map((savedBuild, index) => (
                    savedBuild.buildRef ? (
                        <SavedBuildCard key={index} savedBuild={savedBuild} server={server} user={user} setUser={setUser} colors={colors} styles={styles} router={router} />
                    ) : null
                ))
            ) : (
                <Text style={styles.emptyText}>{i18n.t('prof_empty_builds')}</Text>
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
                                <Text style={[styles.segmentText, activeTab === 'info' && styles.segmentTextActive]}>{i18n.t('prof_tab_info')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.segmentBtn, activeTab === 'builds' && styles.segmentBtnActive]} onPress={() => setActiveTab('builds')}>
                                <Text style={[styles.segmentText, activeTab === 'builds' && styles.segmentTextActive]}>{i18n.t('prof_tab_builds')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {isLandscape ? (
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