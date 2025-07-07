import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import tr from './locales/tr.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import pl from './locales/pl.json';

const resources = {
  de: { translation: de },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  it: { translation: it },
  tr: { translation: tr },
  ru: { translation: ru },
  ar: { translation: ar },
  pl: { translation: pl },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'de', // Standardsprache
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false, // React macht das schon
    },
  });

export default i18n; 