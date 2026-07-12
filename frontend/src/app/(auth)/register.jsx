import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useState, useContext } from 'react';
import { 
  Text, TextInput, View, KeyboardAvoidingView, Platform, 
  TouchableWithoutFeedback, Keyboard, Pressable, 
  ScrollView, ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ServerContext } from '../../context/server-context';
import { useStyles, useAppTheme } from '../../context/theme-context';
import { getStyles, getThemeColors } from '../../constants/AppStyle.js';
import { generateRegisterStyles } from '../../constants/RegisterStyle.js';
import i18n from '../../localization/translation';

const CustomInput = ({ label, value, onChangeText, onBlur, placeholder, security, keyboardType, validationState, errorMessage, leftIcon, onToggleSecurity, colors, styles }) => {
  const getBorderColor = () => {
    if (validationState === 'valid') return colors.successGreen;
    if (validationState === 'invalid') return colors.errorRed;
    return colors.borderColor;
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor: getBorderColor(), backgroundColor: colors.inputBackground }]}>
        {leftIcon && <MaterialCommunityIcons name={leftIcon} size={20} color={colors.textGrey} style={{ marginRight: 10 }}/>}
        <TextInput
          style={[styles.input, { color: colors.textMain }]}
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

export default function RegisterScreen() {
  const router = useRouter();
  const { server } = useContext(ServerContext);
  
  const [fontsLoaded, fontError] = useFonts({
    'Jomhuria': require('../../../assets/fonts/Jomhuria-Regular.ttf'),
  });

  const styles = useStyles(generateRegisterStyles);
  const { isLandscape, colors, theme } = useAppTheme();

  const [birthday, setBirthday] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [values, setValues] = useState({ id: "", name: "", email: "", phone: "", password: "" });
  const [validation, setValidation] = useState({ id: null, name: null, email: null, phone: null, password: null, birthday: null });
  
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState({ text: "", type: "" });

  if (!fontsLoaded && !fontError) return null;  

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  const isValidIsraeliID = (id) => {
    let strId = String(id).trim();
    if (strId.length > 9 || strId.length < 5) return false;
    strId = strId.padStart(9, '0'); 
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        let num = Number(strId[i]);
        let step = num * ((i % 2) + 1);
        if (step > 9) step -= 9;
        sum += step;
    }
    return sum % 10 === 0;
  };

  const handleValidation = (field, value) => {
    let isValid = false;
    switch (field) {
      case 'id':
        isValid = /^\d+$/.test(value) && isValidIsraeliID(value);
        break;
      case 'name':
        isValid = value.trim().length >= 2;
        break;
      case 'email':
        isValid = /^[a-zA-Z0-9._%+-]+@(walla|gmail)\.(com|co\.il)$/.test(value);
        break;
      case 'phone':
        const cleanPhone = value.replace(/-/g, "");
        isValid = /^05\d{8}$/.test(cleanPhone);
        break;
      case 'birthday':
        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        isValid = age > 21 || (age === 21 && today < new Date(value.getFullYear() + 21, value.getMonth(), value.getDate()));
        break;
      case 'password':
        isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
        break;
    }
    setValidation(prev => ({ ...prev, [field]: value.length === 0 ? null : (isValid ? 'valid' : 'invalid') }));
  };

  const isFormComplete = Object.values(validation).every(val => val === 'valid');

  const handleRegister = async () => {
    setServerMsg({ text: "", type: "" });
    if (!isFormComplete) return;

    setLoading(true);
    
    const formattedBirthday = birthday.toISOString().split('T')[0];

    try {
        const response = await server.post('/users/register', {
            id: values.id, 
            name: values.name, 
            email: values.email, 
            phone: values.phone, 
            birthday: formattedBirthday, 
            password: values.password
        });
        
        setServerMsg({ text: i18n.t('reg_msg_success'), type: "success" });
        setTimeout(() => {
            router.replace('/(auth)/login');
        }, 2000);
    } catch (error) {
        console.error('Error registering:', error);
        if (error.response && error.response.status === 409) {
            setServerMsg({ text: i18n.t('reg_err_exists'), type: "error" });
        } else {
            setServerMsg({ text: i18n.t('reg_err_failed'), type: "error" });
        }
        setLoading(false);
    }
  };

  const leftSideFields = (
    <>
      <CustomInput label={i18n.t('reg_label_id')} placeholder="123456789" value={values.id} onChangeText={(text) => setValues({ ...values, id: text })} onBlur={() => handleValidation('id', values.id)} validationState={validation.id} errorMessage={i18n.t('reg_err_id')} leftIcon="card-account-details-outline" keyboardType="numeric" colors={colors} styles={styles} />
      <CustomInput label={i18n.t('reg_label_name')} placeholder="Sarah Smith" value={values.name} onChangeText={(text) => setValues({ ...values, name: text })} onBlur={() => handleValidation('name', values.name)} validationState={validation.name} errorMessage={i18n.t('reg_err_name')} leftIcon="account-outline" colors={colors} styles={styles} />
      <CustomInput label={i18n.t('reg_label_email')} placeholder="sarah@gmail.com" value={values.email} onChangeText={(text) => setValues({ ...values, email: text })} onBlur={() => handleValidation('email', values.email)} validationState={validation.email} errorMessage={i18n.t('reg_err_email')} leftIcon="email-outline" keyboardType="email-address" colors={colors} styles={styles} />
      <CustomInput label={i18n.t('reg_label_phone')} placeholder="0541234567" value={values.phone} onChangeText={(text) => setValues({ ...values, phone: text })} onBlur={() => handleValidation('phone', values.phone)} validationState={validation.phone} errorMessage={i18n.t('reg_err_phone')} leftIcon="phone-outline" keyboardType="phone-pad" colors={colors} styles={styles} />
    </>
  );

  const rightSideFields = (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{i18n.t('reg_label_dob')}</Text>
        <Pressable 
          style={[ styles.inputWrapper, { borderColor: validation.birthday === 'valid' ? colors.successGreen : validation.birthday === 'invalid' ? colors.errorRed : colors.borderColor, backgroundColor: colors.inputBackground } ]} 
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialCommunityIcons name="balloon" size={20} color={colors.textGrey} style={{ marginRight: 20 }}/>
          <Text style={[styles.dateValue, { color: birthday ? colors.textMain : colors.textGrey }]}>
            {birthday ? birthday.toLocaleDateString() : 'DD/MM/YYYY'}
          </Text>
          <MaterialCommunityIcons name="calendar-outline" size={20} color={colors.textGrey} />
        </Pressable>
        {validation.birthday === 'invalid' && <Text style={styles.errorText}>{i18n.t('reg_err_dob')}</Text>}
        
        {(Platform.OS === 'ios' || showDatePicker) && (
          <DateTimePicker value={birthday || maxDate} maximumDate={maxDate} display="default"
            onChange={(e, date) => {
              if (Platform.OS !== 'ios') setShowDatePicker(false);
              if (date) { setBirthday(date); handleValidation('birthday', date); }
            }}
          />
        )}
      </View>

      <CustomInput label={i18n.t('reg_label_pass')} leftIcon="lock-outline" placeholder="********" value={values.password} onChangeText={(text) => setValues({ ...values, password: text })} onBlur={() => handleValidation('password', values.password)} validationState={validation.password} errorMessage={i18n.t('reg_err_pass')} security={!showPassword} onToggleSecurity={() => setShowPassword(!showPassword)} colors={colors} styles={styles} />

      {serverMsg.text ? (
        <Text style={[styles.serverMessage, { color: serverMsg.type === 'success' ? colors.successGreen : colors.errorRed }]}>
            {serverMsg.text}
        </Text>
      ) : null}

      <Pressable 
        style={[styles.registerButton, isFormComplete ? styles.registerButtonActive : null]}
        onPress={handleRegister}
        disabled={loading || !isFormComplete}
      >
        {loading ? (
            <ActivityIndicator color="#FFFFFF" />
        ) : (
            <>
                <Text style={[styles.registerButtonText, isFormComplete && {color: '#FFFFFF'}]}>{i18n.t('reg_btn_submit')}</Text>
                <Text style={[styles.registerButtonSubtext, isFormComplete && {color: '#FFFFFF'}]}>{isFormComplete ? i18n.t('reg_status_ready') : i18n.t('reg_status_incomplete')}</Text>
            </>
        )}
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