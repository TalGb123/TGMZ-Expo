import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ServerContext } from '../../context/server-context';
import { Link, useRouter } from 'expo-router';
import { useStyles, useAppTheme } from '../../context/theme-context.js';

export default function LoginScreen() {
    const router = useRouter();
    
    // Global state and theme contexts
    const { server, setUser } = useContext(ServerContext);
    const styles = useStyles(generateStyles);
    const { colors } = useAppTheme();

    // Form states
    const [identifier, setIdentifier] = useState(""); 
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Validation and loading states
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    // Form validation logic matching the web application
    const validateForm = () => {
        const newErrors = {};
        if (!identifier.trim()) {
            newErrors.identifier = "Please enter your ID or Email";
        }
        if (!password.trim()) {
            newErrors.password = "Please enter your password";
        }
        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Authentication request handler
    const handleLogin = async () => {
        setFieldErrors({});
        setGeneralError("");

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await server.get(`/users/login`, {
                params: {
                    id: identifier,
                    pass: password
                }
            });

            if (response.status === 200) {
                // Save user to global context upon success
                setUser(response.data.user);
                
                setLoading(false);
                // Redirect to the main application
                router.replace('/(tabs)/products'); 
            }
        } catch (error) {
            setLoading(false);
            console.error("Login Error:", error);

            if (error.response && (error.response.status === 404 || error.response.status === 401)) {
                setGeneralError("❌ Wrong email/id and/or password");
            } else {
                setGeneralError("❌ Server Error. Please try again later.");
            }
        }
    };

    const handleGuest = () => {
    setUser(null);
    router.replace('/(tabs)/products'); 
    };

    return (
        <KeyboardAvoidingView 
            style={styles.keyboardAvoiding} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    
                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>Welcome to TGMZ</Text>
                        <Text style={styles.subHeader}>Please sign in to continue</Text>
                    </View>

                    {/* Identifier Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>ID or Email</Text>
                        <View style={[styles.inputWrapper, fieldErrors.identifier && { borderColor: colors.errorRed }]}>
                            <MaterialCommunityIcons name="account-outline" size={20} color={colors.textGrey} style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input}
                                placeholder="Enter ID or Email"
                                placeholderTextColor={colors.textGrey}
                                value={identifier}
                                onChangeText={(text) => {
                                    setIdentifier(text);
                                    if (fieldErrors.identifier) setFieldErrors(prev => ({ ...prev, identifier: null }));
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        {fieldErrors.identifier && <Text style={styles.errorText}>{fieldErrors.identifier}</Text>}
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[styles.inputWrapper, fieldErrors.password && { borderColor: colors.errorRed }]}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textGrey} style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input}
                                placeholder="Enter Password"
                                placeholderTextColor={colors.textGrey}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                                }}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textGrey} />
                            </TouchableOpacity>
                        </View>
                        {fieldErrors.password && <Text style={styles.errorText}>{fieldErrors.password}</Text>}
                    </View>

                    {/* Server Error Message */}
                    {generalError ? (
                        <View style={styles.generalErrorContainer}>
                            <Text style={styles.generalErrorText}>{generalError}</Text>
                        </View>
                    ) : null}

                    {/* Actions */}
                    <TouchableOpacity 
                        style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.btnText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    {/* New Guest Button */}
                    <TouchableOpacity 
                        style={[styles.primaryBtn, { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.borderColor, marginTop: 0 }]} 
                        onPress={handleGuest}
                    >
                        <Text style={[styles.btnText, { color: colors.textMain }]}>Continue as Guest</Text>
                    </TouchableOpacity>

                    {/* Fixed Register Navigation (Using push instead of replace) */}
                    <TouchableOpacity 
                        style={styles.secondaryBtn} 
                        onPress={() => router.push('/(auth)/register')} 
                    >
                        <Text style={styles.secondaryBtnText}>Don't have an account? Register here</Text>
                    </TouchableOpacity>

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const generateStyles = (colors) => ({
    keyboardAvoiding: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        paddingHorizontal: 24,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    header: { 
        fontSize: 28, 
        fontWeight: 'bold',
        color: colors.textMain,
        marginBottom: 8
    },
    subHeader: {
        fontSize: 16,
        color: colors.textGrey,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMain,
        marginBottom: 6,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 50,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: colors.textMain,
        fontSize: 15,
        height: '100%',
    },
    errorText: {
        color: colors.errorRed,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    generalErrorContainer: {
        backgroundColor: colors.errorRed + '20', // 20 adds slight transparency for a background tint
        borderWidth: 1,
        borderColor: colors.errorRed,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    generalErrorText: {
        color: colors.errorRed,
        fontWeight: '600',
        fontSize: 14,
    },
    primaryBtn: {
        backgroundColor: colors.primaryAccent,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    secondaryBtn: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    secondaryBtnText: {
        color: colors.textMain,
        fontSize: 14,
        fontWeight: '600'
    }
});