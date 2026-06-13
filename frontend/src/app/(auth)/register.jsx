import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import { 
  Text, TextInput, View, KeyboardAvoidingView, Platform, 
  TouchableWithoutFeedback, Keyboard, Pressable, 
  useWindowDimensions, useColorScheme, ScrollView 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getStyles, getThemeColors } from '../../constants/AppStyle.js';

const CustomInput = ({ label, value, onChangeText, onBlur, placeholder, security, keyboardType, validationState, errorMessage, leftIcon, onToggleSecurity, colors }) => {
  const getBorderColor = () => {
    if (validationState === 'valid') return colors.successGreen;
    if (validationState === 'invalid') return colors.errorRed;
    return colors.inputBorder;
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor: getBorderColor() }]}>
        {leftIcon && <MaterialCommunityIcons name={leftIcon} size={20} color={colors.textGrey} style={{ marginRight: 10 }}/>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textGrey}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={security}
          keyboardType={keyboardType}
        />
        {onToggleSecurity && (
          <Pressable onPress={onToggleSecurity}>
            <MaterialCommunityIcons name={security ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textGrey} />
          </Pressable>
        )}
      </View>
      {validationState === 'invalid' && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

let styles = {};

export default function RegisterScreen() {
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
  'Jomhuria': require('../../../assets/fonts/Jomhuria-Regular.ttf'),
  });

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const systemTheme = useColorScheme(); 
  const theme = systemTheme || 'light'; 
  
  styles = getStyles(theme, isLandscape);
  const colors = getThemeColors(theme);

  const [birthday, setBirthday] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [validation, setValidation] = useState({ firstName: null, lastName: null, email: null, phone: null, password: null, birthday: null });

  if (!fontsLoaded && !fontError) return null;  

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  const handleValidation = (field, value) => {
    let isValid = false;
    switch (field) {
      case 'firstName':
      case 'lastName':
        isValid = value.length >= 2 && /^[a-zA-Z]+$/.test(value);
        break;
      case 'email':
        isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        break;
      case 'phone':
        isValid = /^\d{10}$/.test(value);
        break;
      case 'birthday':
        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        isValid = age > 21 || (age === 21 && today < new Date(value.getFullYear() + 21, value.getMonth(), value.getDate()));
        break;
      case 'password':
        isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{10,}$/.test(value);
        break;
    }
    setValidation(prev => ({ ...prev, [field]: value.length === 0 ? null : (isValid ? 'valid' : 'invalid') }));
  };

  const isFormComplete = Object.values(validation).every(val => val === 'valid');

  const handleRegister = () => {
    if (isFormComplete) {
      router.replace('/(tabs)/products');
    }
  };

  const leftSideFields = (
    <>
      <CustomInput label="First Name" placeholder="Sarah" value={values.firstName} onChangeText={(text) => setValues({ ...values, firstName: text })} onBlur={() => handleValidation('firstName', values.firstName)} validationState={validation.firstName} errorMessage="Must be at least 2 characters and letters only." leftIcon="account-outline" colors={colors} />
      <CustomInput label="Last Name" placeholder="Smith" value={values.lastName} onChangeText={(text) => setValues({ ...values, lastName: text })} onBlur={() => handleValidation('lastName', values.lastName)} validationState={validation.lastName} errorMessage="Must be at least 2 characters and letters only." leftIcon="account-outline" colors={colors} />
      <CustomInput label="Email Address" placeholder="sarah.smith@example.com" value={values.email} onChangeText={(text) => setValues({ ...values, email: text })} onBlur={() => handleValidation('email', values.email)} validationState={validation.email} errorMessage="Enter a valid email address." leftIcon="email-outline" keyboardType="email-address" colors={colors} />
      <CustomInput label="Phone Number" placeholder="0541234567" value={values.phone} onChangeText={(text) => setValues({ ...values, phone: text })} onBlur={() => handleValidation('phone', values.phone)} validationState={validation.phone} errorMessage="Must be exactly 10 digits." leftIcon="phone-outline" keyboardType="phone-pad" colors={colors} />
    </>
  );

  const rightSideFields = (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date of Birth</Text>
        <Pressable 
          style={[ styles.inputWrapper, { borderColor: validation.birthday === 'valid' ? colors.successGreen : validation.birthday === 'invalid' ? colors.errorRed : colors.inputBorder } ]} 
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialCommunityIcons name="balloon" size={20} color={colors.textGrey} style={{ marginRight: 20 }}/>
          <Text style={[styles.dateValue, { color: birthday ? colors.textMain : colors.textGrey }]}>
            {birthday ? birthday.toLocaleDateString() : 'DD/MM/YYYY'}
          </Text>
          <MaterialCommunityIcons name="calendar-outline" size={20} color={colors.textGrey} />
        </Pressable>
        {validation.birthday === 'invalid' && <Text style={styles.errorText}>Must be at least 21 years old.</Text>}
        
        {(Platform.OS === 'ios' || showDatePicker) && (
          <DateTimePicker value={birthday || maxDate} maximumDate={maxDate} display="default"
            onChange={(e, date) => {
              if (Platform.OS !== 'ios') setShowDatePicker(false);
              if (date) { setBirthday(date); handleValidation('birthday', date); }
            }}
          />
        )}
      </View>

      <CustomInput label="Password" leftIcon="lock-outline" placeholder="********" value={values.password} onChangeText={(text) => setValues({ ...values, password: text })} onBlur={() => handleValidation('password', values.password)} validationState={validation.password} errorMessage="Must include 8+ chars, a number, and uppercase letter." security={!showPassword} onToggleSecurity={() => setShowPassword(!showPassword)} colors={colors} />

      <Pressable 
        style={[styles.registerButton, isFormComplete ? styles.registerButtonActive : null]}
        onPress={handleRegister}
      >
        <Text style={[styles.registerButtonText, isFormComplete && {color: '#FFFFFF'}]}>SIGN UP</Text>
        <Text style={[styles.registerButtonSubtext, isFormComplete && {color: '#FFFFFF'}]}>{isFormComplete ? "Ready" : "Incomplete"}</Text>
      </Pressable>
    </>
  );

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardAvoiding} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.mainContainer}> 
            <View style={styles.headerContainer}>
              <Text style={styles.mainTitle}>TGMZ</Text>
            </View>

            <View style={styles.formContainer}>
              {isLandscape ? (
                <View style={styles.landscapeRow}>
                  <View style={styles.landscapeColumn}>{leftSideFields}</View>
                  <View style={styles.landscapeColumn}>{rightSideFields}</View>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.portraitScroll}>
                  {leftSideFields}
                  {rightSideFields}
                </ScrollView>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} /> 
    </View>
  );
}