import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";
import en from './languages/en.json';
import he from './languages/he.json';

const i18n = new I18n({ en, he });

i18n.locale = getLocales()[0]?.languageCode || "he";
i18n.enableFallback = true;
i18n.defaultLocale = "he";

export default i18n;