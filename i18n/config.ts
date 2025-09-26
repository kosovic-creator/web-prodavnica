import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import sr from './sr.json';
import proizvodi_en from './proizvodi_en.json';
import proizvodi_sr from './proizvodi_sr.json';
import porudzbine_en from './porudzbine_en.json';
import porudzbine_sr from './porudzbine_sr.json';
import korisnici_en from './korisnici_en.json';
import korisnici_sr from './korisnici_sr.json';
import korpa_en from './korpa_en.json';
import korpa_sr from './korpa_sr.json';
import login_en from './login_en.json';
import login_sr from './login_sr.json';
import logout_en from './logout_en.json';
import logout_sr from './logout_sr.json';
import register_en from './register_en.json';
import register_sr from './register_sr.json';
import navbar_en from './navbar_en.json';
import navbar_sr from './navbar_sr.json';
import profil_en from './profil_en.json';
import profil_sr from './profil_sr.json';
import home_en from './home_en.json';
import home_sr from './home_sr.json';
import sidebar_en from './sidebar_en.json';
import sidebar_sr from './sidebar_sr.json';
import notFound_en from './notFound_en.json';
import notFound_sr from './notFound_sr.json';
import placanje_en from './placanje_en.json';
import placanje_sr from './placanje_sr.json';


i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
        proizvodi: proizvodi_en,
        porudzbine: porudzbine_en,
        korisnici: korisnici_en,
        korpa: korpa_en,
        login: login_en,
        logout: logout_en,
        register: register_en,
        navbar: navbar_en,
        profil: profil_en,
        home: home_en,
        sidebar: sidebar_en,
        notFound: notFound_en,
        placanje: placanje_en,
      },
      sr: {
        translation: sr,
        proizvodi: proizvodi_sr,
        porudzbine: porudzbine_sr,
        korisnici: korisnici_sr,
        korpa: korpa_sr,
        login: login_sr,
        logout: logout_sr,
        register: register_sr,
        navbar: navbar_sr,
        profil: profil_sr,
        home: home_sr,
        sidebar: sidebar_sr,
        notFound: notFound_sr,
        placanje: placanje_sr,
      },
    },
    lng: 'sr',
    fallbackLng: 'sr',
    interpolation: { escapeValue: false },
  });

export default i18n;
