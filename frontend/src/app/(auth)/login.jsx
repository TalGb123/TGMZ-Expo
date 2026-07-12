import { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServerContext } from '../../context/server-context';
import { Link, useRouter } from 'expo-router';
import { useStyles, useAppTheme } from '../../context/theme-context.js';
import { generateLoginStyles } from '../../constants/LoginStyle.js';
import i18n from '../../localization/translation';

export default function LoginScreen() {
    const router = useRouter();
    const { server, setUser } = useContext(ServerContext);
    const styles = useStyles(generateLoginStyles);
    const { colors } = useAppTheme();

    const [identifier, setIdentifier] = useState(""); 
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    const [showLangMenu, setShowLangMenu] = useState(false);
    const [currentLocale, setCurrentLocale] = useState(i18n.locale);

    const changeLanguage = async (langCode) => {
        i18n.locale = langCode;
        setCurrentLocale(langCode);
        setShowLangMenu(false);
        await AsyncStorage.setItem('app_language', langCode);
    };

    useEffect(() => {
        const loadCredentials = async () => {
            try {
                
                const savedLang = await AsyncStorage.getItem('app_language');
                if (savedLang) {
                    i18n.locale = savedLang;
                    setCurrentLocale(savedLang);
                }

                const savedId = await AsyncStorage.getItem('saved_identifier');
                const savedPass = await AsyncStorage.getItem('saved_password');
                if (savedId && savedPass) {
                    setIdentifier(savedId);
                    setPassword(savedPass);
                    setRememberMe(true);
                }
            } catch (err) {
                console.error("Failed to load credentials", err);
            }
        };
        loadCredentials();
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!identifier.trim()) newErrors.identifier = i18n.t('login_err_empty_id');
        if (!password.trim()) newErrors.password = i18n.t('login_err_empty_pass');
        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        setFieldErrors({});
        setGeneralError("");
        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await server.get(`/users/login`, {
                params: { 
                    id: identifier,
                    pass: password
                }
            });

            if (response.status === 200) {
                setUser(response.data.user);
                
                if (rememberMe) {
                    await AsyncStorage.setItem('saved_identifier', identifier);
                    await AsyncStorage.setItem('saved_password', password);
                } else {
                    await AsyncStorage.removeItem('saved_identifier');
                    await AsyncStorage.removeItem('saved_password');
                }

                setLoading(false);
                router.replace('/(tabs)/products'); 
            }
        } catch (error) {
            setLoading(false);
            if (error.response && (error.response.status === 404 || error.response.status === 401)) {
                setGeneralError(i18n.t('login_err_wrong_creds'));
            } else {
                setGeneralError(i18n.t('login_err_server'));
            }
        }
    };

    const handleGuest = () => {
        setUser(null);
        router.replace('/(tabs)/products'); 
    };

    return (
        <KeyboardAvoidingView style={styles.keyboardAvoiding} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.langSwitcherContainer}>
                        <TouchableOpacity onPress={() => setShowLangMenu(!showLangMenu)}>
                            <MaterialCommunityIcons name="web" size={28} color={colors.textMain} />
                        </TouchableOpacity>

                        {showLangMenu && (
                            <View style={styles.langMenu}>
                                <TouchableOpacity onPress={() => changeLanguage('en')} style={styles.langOptionTop}>
                                    <Text style={[styles.langText, { fontWeight: currentLocale === 'en' ? 'bold' : 'normal' }]}>English</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => changeLanguage('he')} style={styles.langOptionBottom}>
                                    <Text style={[styles.langText, { fontWeight: currentLocale === 'he' ? 'bold' : 'normal' }]}>עברית</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>{i18n.t('login_welcome')}</Text>
                        <Text style={styles.subHeader}>{i18n.t('login_subtext')}</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{i18n.t('login_label_id')}</Text>
                        <View style={[styles.inputWrapper, fieldErrors.identifier && { borderColor: colors.errorRed }]}>
                            <MaterialCommunityIcons name="account-outline" size={20} color={colors.textGrey} style={styles.inputIcon} />
                            <TextInput style={styles.input} placeholder={i18n.t('login_placeholder_id')} placeholderTextColor={colors.textGrey} value={identifier} onChangeText={(text) => { setIdentifier(text); if (fieldErrors.identifier) setFieldErrors(prev => ({ ...prev, identifier: null })); }} keyboardType="email-address" autoCapitalize="none" />
                        </View>
                        {fieldErrors.identifier && <Text style={styles.errorText}>{fieldErrors.identifier}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{i18n.t('login_label_pass')}</Text>
                        <View style={[styles.inputWrapper, fieldErrors.password && { borderColor: colors.errorRed }]}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textGrey} style={styles.inputIcon} />
                            <TextInput style={styles.input} placeholder={i18n.t('login_placeholder_pass')} placeholderTextColor={colors.textGrey} value={password} onChangeText={(text) => { setPassword(text); if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null })); }} secureTextEntry={!showPassword} />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textGrey} />
                            </TouchableOpacity>
                        </View>
                        {fieldErrors.password && <Text style={styles.errorText}>{fieldErrors.password}</Text>}
                    </View>

                    <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
                        <MaterialCommunityIcons name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color={rememberMe ? colors.primaryAccent : colors.textGrey} />
                        <Text style={styles.rememberText}>{i18n.t('login_remember')}</Text>
                    </TouchableOpacity>

                    {generalError ? (
                        <View style={styles.generalErrorContainer}>
                            <Text style={styles.generalErrorText}>{generalError}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>{i18n.t('login_btn_submit')}</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.borderColor, marginTop: 0 }]} onPress={handleGuest}>
                        <Text style={[styles.btnText, { color: colors.textMain }]}>{i18n.t('login_btn_guest')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/register')}>
                        <Text style={styles.secondaryBtnText}>{i18n.t('login_btn_register')}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}