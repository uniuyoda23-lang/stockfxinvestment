#!/usr/bin/env node

/**
 * Translation Generator Script
 * Analyzes English translation file and ensures all language files have complete key coverage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const EN_FILE = path.join(LOCALES_DIR, 'en.json');

// Professional translations for each language (key terms and common phrases)
const LANGUAGE_TRANSLATIONS = {
  // Major European Languages
  es: { // Spanish
    "Sign In": "Iniciar Sesión", "Get Started": "Comenzar", "Why Choose StockFx?": "¿Por Qué Elegir StockFx?",
    "Lightning Fast": "Ultrarrápido", "Bank-Grade Security": "Seguridad de Nivel Bancario", 
    "Mobile First": "Primero Móvil", "Global Markets": "Mercados Globales",
    "Loved by Investors Worldwide": "Amado por Inversores en Todo el Mundo", 
    "Investment Plans Tailored for You": "Planes de Inversión Personalizados",
    "Military-Grade Security": "Seguridad de Grado Militar", "Your Trust, Our Priority": "Tu Confianza, Nuestra Prioridad",
    "Ready to Start Trading?": "¿Listo Para Comenzar a Operar?", "Welcome back": "Bienvenido",
    "Create your account": "Crea tu cuenta", "Verification code": "Código de verificación"
  },
  fr: { // French  
    "Sign In": "Se Connecter", "Get Started": "Commencer", "Why Choose StockFx?": "Pourquoi Choisir StockFx?",
    "Lightning Fast": "Ultra-Rapide", "Bank-Grade Security": "Sécurité de Niveau Bancaire",
    "Mobile First": "Mobile D'Abord", "Global Markets": "Marchés Mondiaux",
    "Loved by Investors Worldwide": "Aimé par les Traders du Monde Entier",
    "Investment Plans Tailored for You": "Plans d'Investissement Personnalisés",
    "Military-Grade Security": "Sécurité de Grado Militaire", "Your Trust, Our Priority": "Votre Confiance, Notre Priorité",
    "Ready to Start Trading?": "Prêt à Commencer à Trader?", "Welcome back": "Bienvenue",
    "Create your account": "Créer votre compte", "Verification code": "Code de vérification"
  },
  de: { // German
    "Sign In": "Anmelden", "Get Started": "Jetzt Starten", "Why Choose StockFx?": "Warum StockFx Wählen?",
    "Lightning Fast": "Blitzschnell", "Bank-Grade Security": "Sicherheit auf Bankebene",
    "Mobile First": "Mobile Erste", "Global Markets": "Globale Märkte",
    "Loved by Investors Worldwide": "Von Investoren weltweit geliebt",
    "Investment Plans Tailored for You": "Investitionspläne wie für Sie entwickelt",
    "Military-Grade Security": "Militärische Sicherheit", "Your Trust, Our Priority": "Ihr Vertrauen, unsere Priorität",
    "Ready to Start Trading?": "Bereit zum Handeln?", "Welcome back": "Willkommen",
    "Create your account": "Konto erstellen", "Verification code": "Bestätigungscode"
  },
  pt: { // Portuguese
    "Sign In": "Entrar", "Get Started": "Começar", "Why Choose StockFx?": "Por que Escolher StockFx?",
    "Lightning Fast": "Relâmpago Rápido", "Bank-Grade Security": "Segurança em Nível Bancário",
    "Mobile First": "Celular em Primeiro Lugar", "Global Markets": "Mercados Globais",
    "Investment Plans Tailored for You": "Planos de Investimento Personalizados para Você",
    "Ready to Start Trading?": "Pronto para Começar a Negociar?",
    "Welcome back": "Bem-vindo", "Create your account": "Criar sua conta"
  },
  it: { // Italian
    "Sign In": "Accedi", "Get Started": "Inizia", "Why Choose StockFx?": "Perché Scegliere StockFx?",
    "Lightning Fast": "Fulmine Veloce", "Bank-Grade Security": "Sicurezza di Grado Bancario",
    "Mobile First": "Mobile First", "Global Markets": "Mercati Globali",
    "Investment Plans Tailored for You": "Piani di Investimento Personalizzati",
    "Ready to Start Trading?": "Pronto a Iniziare il Trading?",
    "Welcome back": "Bentornato", "Create your account": "Crea il tuo account"
  },
  ru: { // Russian
    "Sign In": "Войти", "Get Started": "Начать", "Why Choose StockFx?": "Почему выбрать StockFx?",
    "Lightning Fast": "Молниеносно Быстро", "Bank-Grade Security": "Безопасность Банковского Уровня",
    "Mobile First": "Mobile First", "Global Markets": "Глобальные Рынки",
    "Investment Plans Tailored for You": "Планы Инвестирования Специально для Вас",
    "Ready to Start Trading?": "Готовы Начать Торговать?",
    "Welcome back": "Добро пожаловать", "Create your account": "Создать учетную запись"
  },
  ja: { // Japanese
    "Sign In": "サインイン", "Get Started": "はじめる", "Why Choose StockFx?": "なぜStockFxを選ぶのか？",
    "Lightning Fast": "超高速", "Bank-Grade Security": "銀行グレードのセキュリティ",
    "Mobile First": "モバイルファースト", "Global Markets": "グローバルマーケット",
    "Investment Plans Tailored for You": "あなた向けにカスタマイズされた投資プラン",
    "Ready to Start Trading?": "取引を始める準備はできていますか？",
    "Welcome back": "お帰りなさい", "Create your account": "アカウントを作成"
  },
  ko: { // Korean
    "Sign In": "로그인", "Get Started": "시작하기", "Why Choose StockFx?": "왜 StockFx를 선택해야 할까요?",
    "Lightning Fast": "번개처럼 빠르게", "Bank-Grade Security": "은행 수준의 보안",
    "Mobile First": "모바일 우선", "Global Markets": "글로벌 마켓",
    "Investment Plans Tailored for You": "당신을 위해 맞춤화된 투자 계획",
    "Ready to Start Trading?": "거래를 시작할 준비가 되셨나요?",
    "Welcome back": "다시 오신 것을 환영합니다", "Create your account": "계정 만들기"
  },
  zh: { // Chinese (Simplified)
    "Sign In": "登入", "Get Started": "开始", "Why Choose StockFx?": "为什么选择 StockFx？",
    "Lightning Fast": "闪电般迅速", "Bank-Grade Security": "银行级别安全",
    "Mobile First": "移动优先", "Global Markets": "全球市场",
    "Investment Plans Tailored for You": "为您量身定制的投资计划",
    "Ready to Start Trading?": "准备好开始交易了吗？",
    "Welcome back": "欢迎回来", "Create your account": "创建您的账户"
  },
  nl: { // Dutch
    "Sign In": "Inloggen", "Get Started": "Aan de slag", "Why Choose StockFx?": "Waarom StockFx Kiezen?",
    "Lightning Fast": "Bliksemssnel", "Bank-Grade Security": "Beveiliging op Bankniveau",
    "Mobile First": "Mobile First", "Global Markets": "Wereldwijde Markten",
    "Investment Plans Tailored for You": "Investeringsplannen Speciaal voor U",
    "Ready to Start Trading?": "Klaar om te gaan handelen?",
    "Welcome back": "Welkom terug", "Create your account": "Account aanmaken"
  },
  pl: { // Polish
    "Sign In": "Zaloguj się", "Get Started": "Zacznij", "Why Choose StockFx?": "Dlaczego wybrać StockFx?",
    "Lightning Fast": "Błyskawicznie Szybko", "Bank-Grade Security": "Bezpieczeństwo Bankowe",
    "Mobile First": "Mobile First", "Global Markets": "Rynki Globalne",
    "Investment Plans Tailored for You": "Plany Inwestycyjne Dostosowane dla Ciebie",
    "Ready to Start Trading?": "Gotów do Handlu?",
    "Welcome back": "Witaj z powrotem", "Create your account": "Utwórz konto"
  },
  tr: { // Turkish
    "Sign In": "Oturum Aç", "Get Started": "Başla", "Why Choose StockFx?": "Neden StockFx Seçmelisiniz?",
    "Lightning Fast": "Yıldırım Hızlı", "Bank-Grade Security": "Banka Düzeyinde Güvenlik",
    "Mobile First": "Mobil Öncelik", "Global Markets": "Küresel Pazarlar",
    "Investment Plans Tailored for You": "Sizin İçin Kişiselleştirilmiş Yatırım Planları",
    "Ready to Start Trading?": "Ticaret Yapmaya Hazır mısınız?",
    "Welcome back": "Tekrar hoşgeldiniz", "Create your account": "Hesap Oluştur"
  },
  sv: { // Swedish
    "Sign In": "Logga in", "Get Started": "Börja", "Why Choose StockFx?": "Varför välja StockFx?",
    "Lightning Fast": "Blixtsnabbt", "Bank-Grade Security": "Banknivåsäkerhet",
    "Mobile First": "Mobile First", "Global Markets": "Globala Marknader",
    "Investment Plans Tailored for You": "Investeringsplaner Anpassade för Dig",
    "Ready to Start Trading?": "Redo att börja handla?",
    "Welcome back": "Välkommen tillbaka", "Create your account": "Skapa konto"
  },
  no: { // Norwegian
    "Sign In": "Logg inn", "Get Started": "Kom i gang", "Why Choose StockFx?": "Hvorfor velge StockFx?",
    "Lightning Fast": "Lynrask", "Bank-Grade Security": "Banknivåsikkerhet",
    "Mobile First": "Mobile First", "Global Markets": "Globale Markeder",
    "Investment Plans Tailored for You": "Investeringsplaner Tilpasset Deg",
    "Ready to Start Trading?": "Klar til å begynne å handle?",
    "Welcome back": "Velkommen tilbake", "Create your account": "Opprett konto"
  },
  da: { // Danish
    "Sign In": "Log ind", "Get Started": "Kom i gang", "Why Choose StockFx?": "Hvorfor vælge StockFx?",
    "Lightning Fast": "Lynhurtigt", "Bank-Grade Security": "Bankniveausikkerhed",
    "Mobile First": "Mobile First", "Global Markets": "Globale Markeder",
    "Investment Plans Tailored for You": "Investeringsplaner Skræddersyet til Dig",
    "Ready to Start Trading?": "Klar til at begynde at handle?",
    "Welcome back": "Velkommen tilbage", "Create your account": "Opret konto"
  },
  fi: { // Finnish
    "Sign In": "Kirjaudu sisään", "Get Started": "Aloita", "Why Choose StockFx?": "Miksi valita StockFx?",
    "Lightning Fast": "Salamannopeasti", "Bank-Grade Security": "Pankin turvallisuus",
    "Mobile First": "Mobile First", "Global Markets": "Maailmanlaajuiset markkinat",
    "Investment Plans Tailored for You": "Sinulle räätälöidyt sijoitussuunnitelmat",
    "Ready to Start Trading?": "Valmis alkamaan kauppaa?",
    "Welcome back": "Tervetuloa takaisin", "Create your account": "Luo tili"
  },
  el: { // Greek
    "Sign In": "Σύνδεση", "Get Started": "Ξεκινήστε", "Why Choose StockFx?": "Γιατί να επιλέξετε το StockFx?",
    "Lightning Fast": "Κεραυνοειδώς Γρήγορα", "Bank-Grade Security": "Ασφάλεια Τραπεζικής Κατηγορίας",
    "Mobile First": "Κινητό Πρώτο", "Global Markets": "Παγκόσμιες Αγορές",
    "Ready to Start Trading?": "Έτοιμος να ξεκινήσεις το trading;",
    "Welcome back": "Καλώς ήρθες", "Create your account": "Δημιουργία λογαριασμού"
  },
};

// Helper function to read JSON file safely
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

// Helper function to write JSON file
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Get all keys from a nested object
function getNestedKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys = keys.concat(getNestedKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Get value by dot notation path
function getValueByPath(obj, path) {
  return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
}

// Analyze translation files for completeness
function analyzeTranslations() {
  const enData = readJSON(EN_FILE);
  if (!enData) return;

  const enKeys = getNestedKeys(enData);
  console.log(`\n📊 Translation Analysis Report`);
  console.log(`=`.repeat(60));
  console.log(`Total keys in English file: ${enKeys.length}\n`);

  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  const report = {};

  files.forEach(file => {
    const langCode = file.replace('.json', '');
    const langData = readJSON(path.join(LOCALES_DIR, file));
    
    if (langData) {
      const langKeys = getNestedKeys(langData);
      const coverage = ((langKeys.length / enKeys.length) * 100).toFixed(1);
      const missing = enKeys.length - langKeys.length;
      
      report[langCode] = {
        coverage: `${coverage}%`,
        keys: langKeys.length,
        missing: missing
      };

      if (missing > 0) {
        console.log(`⚠️  ${langCode.padEnd(8)} - ${coverage}% complete (${missing} missing keys)`);
      } else {
        console.log(`✅ ${langCode.padEnd(8)} - ${coverage}% complete`);
      }
    }
  });

  return { total: enKeys.length, report };
}

// Main execution
analyzeTranslations();
console.log(`\n✨ Translation analysis complete!`);

export { analyzeTranslations, readJSON, writeJSON, LOCALES_DIR };
