import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const EN_FILE = path.join(LOCALES_DIR, 'en.json');

// Read English template
const englishContent = JSON.parse(fs.readFileSync(EN_FILE, 'utf8'));

// Comprehensive translations for all 100 languages
// Format: { lang_code: { key_path: translation, ... } }
const translationMap = {
  gu: {
    // Gujarati - Fix corrupted file
    "nav.signIn": "સાઇન ઇન",
    "nav.getStarted": "શરૂ કરો",
    "hero.badge": "🎉 પ્રથમ $10,000 પર મફત રોકાણ",
    "hero.title1": "સમજદારી સાથે રોકાણ કરો.",
    "hero.title2": "અધિક ઝડપથી વૃદ્ધિ કરો.",
    "hero.description": "સ્ટોક્સ, ETFs અને ડિવિડન્ડ રોકાણ માટે આગલી પેઢીનું પ્લેટફોર્મ. વ્યાવસાયિક સાધનો. શૂન્ય જટિલતા. આત્મવિશ્વાસ સાથે રોકાણ કરો.",
    "hero.startButton": "મફત રોકાણ શરૂ કરો",
    "hero.signInButton": "સાઇન ઇન",
    "features.title": "StockFx શા માટે પસંદ કરો?",
    "features.fast.name": "વીજ ગતિ",
    "features.fast.desc": "અત્યંત ઓછી વિલંબ સાથે મિલીસેકંડમાં ઓર્ડર સંપૂર્ણ કરો.",
    "features.security.name": "બેંક-સ્તરનું સુરક્ષા",
    "features.security.desc": "256-બિટ એનક્રિપશન, 2FA, FDIC વીમો સુરક્ષા.",
    "features.mobile.name": "મોબાઇલ પ્રથમ",
    "features.mobile.desc": "બધી વિશેષતાઓ સાથે એપ્લિકેશન. ગમે તે જગ્યાએ રોકાણ કરો.",
    "features.global.name": "વૈશ્વિક બજારો",
    "features.global.desc": "વિશ્વભર સ્ટોક્સ, ETFs, મ્યુચુેલ ફંડ્સ અને બોન્ડ્સ્ ની ઍક્સેસ કરો.",
    "testimonials.title": "વિશ્વભરના રોકાણકારોને પસંદ",
    "testimonials.subtitle": "StockFx પર વિશ્વાસ કરતા 2 મીલિયન થી વધુ રોકાણકારોમાં જોડાઓ",
    "stats.traders": "સક્રિય વ્યાપારીઓ",
    "stats.assets": "રોકાણ શુમાર સંપત્તિ",
    "stats.commission": "કમિશન નથી",
    "stats.uptime": "અપટાઇમ",
    "pricing.title": "તમારા માટે કસ્ટમાઇજ્ડ રોકાણ યોજનાઓ",
    "pricing.subtitle": "તમારા પોર્ટફોલિયો સાઇજ્ની અનુરૂપ રોકાણ સ્તર પસંદ કરો",
    "pricing.starter.name": "સ્ટાર્ટર",
    "pricing.starter.price": "$1,000 - $5,000",
    "pricing.starter.desc": "પ્રાથમિક રોકાણ શ્રેણી",
    "pricing.starter.duration": "1 મહિનો",
    "pricing.pro.name": "પ્રો",
    "pricing.pro.price": "$5,000 - $25,000",
    "pricing.pro.desc": "વૃદ્ધિ રોકાણ શ્રેણી",
    "pricing.pro.duration": "2-3 મહિનો",
    "pricing.pro.popular": "સૌથી લોકપ્રિય",
    "pricing.enterprise.name": "એન્ટરપ્રાઇજ",
    "pricing.enterprise.price": "$25,000+",
    "pricing.enterprise.desc": "પ્રીમિયમ રોકાણ શ્રેણી",
    "pricing.enterprise.duration": "4+ મહિનો",
    "pricing.features.commissionFree": "કમિશન વિનામૂલ્યે વ્યાપાર",
    "pricing.features.basicCharting": "મૂળભૂત ચાર્ટિંગ સાધનો",
    "pricing.features.mobileAccess": "મોબાઇલ ઍપ અ accesss",
    "pricing.features.watchlists": "2 જૂનામ ડી",
    "pricing.features.emailSupport": "ઈમેલ સમર્થન",
    "pricing.features.advancedCharting": "અગ્રણી ચાર્ટિંગ અને વિશ્લેષણ",
    "pricing.features.level2": "વાસ્તવિક સમય સ્તર 2 ડેટા",
    "pricing.features.unlimitedWatchlists": "અમર્યાદ જૂનામ ડી",
    "pricing.features.support24": "કક્ષા 24/7 સમર્થન",
    "pricing.features.apiAccess": "API અ accesss",
    "pricing.features.advancedAlerts": "અગ્રણી અલર્ટ",
    "pricing.features.dedicatedManager": "સમર્પિત પોર્ટફોલિયો વ્યવસ્થાપક",
    "pricing.features.strategy": "કસ્ટમ વ્યૂહરચના પરામર્શ",
    "pricing.features.whiteLabel": "વાઈટલેબલ ઉકેલો",
    "pricing.features.integrations": "અગ્રણી એક્ટિવેશન",
    "pricing.features.sla": "SLA ગેરંટી",
    "pricing.features.institutionalPricing": "સંસ્થાગત કિંમતો",
    "pricing.button": "રોકાણ શરૂ કરો",
    "trust.title": "તમારી વિશ્વાસ, અમારી અગ્રતા",
    "trust.security.name": "લશ્કર ગ્રેડ સુરક્ષા",
    "trust.security.desc": "256-બિટ એનક્રિપશન તમારા તમામ ડેટા સુરક્ષિત રાખે.",
    "trust.insured.name": "FDIC અને SIPC વીમાધાર",
    "trust.insured.desc": "તમારી રોકડ અને સિક્યોરિટીજ સંપૂર્ણ સુરક્ષિત છે.",
    "trust.compliant.name": "નિયમિત અને અનુરૂપ",
    "trust.compliant.desc": "આ તમામ SEC, FINRA અને નિયમોનું પાલન કરે છે.",
    "cta.title": "વ્યાપાર શરૂ કરવા માટે તૈયાર?",
    "cta.subtitle": "લાખો રોકાણકારોમાં જોડાઓ. આજે $50 મુક્ત સ્ટોક મેળવો.",
    "cta.button": "મફત ખાતું બનાવો",
  },
  lo: {
    // Lao - Fix corrupted file
    "nav.signIn": "ເຂົ້າ",
    "nav.getStarted": "ເລີ່ມຕົ້ນ",
    "hero.badge": "🎉 ການລົງທຶນບໍ່ເສຍຄ່າໃນ $10,000 ທໍາອິດ",
    "hero.title1": "ລົງທຶນໄດ້ສະມາດ.",
    "hero.title2": "ເລີນຂຶ້ນໄວ.",
    "hero.description": "ແພັດຟອມຮຸ່ນໃໝ່ສໍາລັບການລົງທຶນໃນສະຕະ, ETFs ແລະເງິນໄຟຟ້າ. ເຄື່ອງມືມືອາຊີບ. ຄວາມສັບສົນສູນ. ລົງທຶນດ້ວຍປະກາດ.",
    "hero.startButton": "ເລີ່ມຕົ້ນການລົງທຶນເລື້ອ",
    "hero.signInButton": "ເຂົ້າ",
    "features.title": "ເປັນຫຍັງຈິ່ງເລືອກ StockFx?",
    "features.fast.name": "ທ່と້ວສຽງສາຍົາຟ້າແສງ",
    "features.fast.desc": "ເຮັດໃຫ້ຄໍາສັ່ງສໍາເລັດພາຍໃນ milliseconds.",
    "features.security.name": "ຄວາມປະຢັດສະທານລະດັບທະນາຄານ",
    "features.security.desc": "ການເຂົ້າລະຫັດ 256-bit, 2FA, ການປົກປ້ອງກະ.",
    "features.mobile.name": "ໂທລະສັບ ທໍາອິດ",
    "features.mobile.desc": "ແອັກອບ coherent ທີ່ມີລາຍລະອຽດທັງໝົດ. ລົງທຶນຢູ່ບ່ອນໃດກໍ່ໄດ",
    "features.global.name": "ຕະຫຼາດທົ່ວໂລກ",
    "features.global.desc": "ເຂົ້າເຖິງຫຸ້ນສະ, ETFs, ກອງທຶນສາທາລະນະ ແລະໜີ້ສິນທົ່ວໂລກ.",
    "testimonials.title": "ມັກໂດຍນັກລົງທຶນທັ່ວໂລກ",
    "testimonials.subtitle": "ເຂົ້າເສີມນັກລົງທຶນກວ່າ 2 ລາກທີ່ເຊື່ອຖືໄໝ້ສະ",
    "stats.traders": "ຜູ້ຄ້າທີ່ຮັກສາ",
    "stats.assets": "ໄປເຖິງ ສຽ ກຸ່ມ",
    "stats.commission": "ບໍ່ມີອາຍສະ",
    "stats.uptime": "ເວລາສະ",
    "pricing.title": "ຮຸ່ນລົງທຶນ",
    "pricing.subtitle": "ເລືອກລະດັບກຸ່ມສາກົນ",
    "pricing.starter.name": "ມາດຕະຖານ",
    "pricing.starter.price": "$1,000 - $5,000",
    "pricing.starter.desc": "ລະດັບລົງທຶນພື້ນຖານ",
    "pricing.starter.duration": "1 ເດືອນ",
    "pricing.pro.name": "ວ່າງາວ",
    "pricing.pro.price": "$5,000 - $25,000",
    "pricing.pro.desc": "ລະດັບາລົງທຶນເລີນ",
    "pricing.pro.duration": "2-3 ເດືອນ",
    "pricing.pro.popular": "ວິທີນິຍົມທີ່ສຸດ",
    "pricing.enterprise.name": "ຕໍ່າກຸ່ມ",
    "pricing.enterprise.price": "$25,000+",
    "pricing.enterprise.desc": "ລະດັບລົງທຶນພະແນກ",
    "pricing.enterprise.duration": "4+ ເດືອນ",
    "pricing.features.commissionFree": "ການຄ້າບໍ່ມີອາຍສະ",
    "pricing.features.basicCharting": "ເຄື່ອງມືລາຟ استفึ້າມະຖານ",
    "pricing.features.mobileAccess": "ທະສໄລ້ວັກ",
    "pricing.features.watchlists": "2 ບັນລາຍການສັກ",
    "pricing.features.emailSupport": "ສົນທະນາ Email",
    "pricing.features.advancedCharting": "ລາຟ ມີ້າວັກ ແລະວິເຄາະ",
    "pricing.features.level2": "ຮັກສາ ທໍາໂລຈຣະດັບ 2",
    "pricing.features.unlimitedWatchlists": "ບັນລາຍການສັກບໍ່ມີຂໍ້ຈໍາກັດ",
    "pricing.features.support24": "ສໍາຫຼະ 24/7 ສົນທະນາ",
    "pricing.features.apiAccess": "ທະສໄລ້ວັກ API",
    "pricing.features.advancedAlerts": "ລາຟ ສຸ້ຫຍຽ",
    "pricing.features.dedicatedManager": "ສະພາບຄຸມ ສາກົນ ທີ່ສົ່ວນຕົວ",
    "pricing.features.strategy": "ຜູ້ຊ່ວຍ ວິທີ້ກຸ່ມ ທຸກສະ",
    "pricing.features.whiteLabel": "ສາກົນ ສ່ວນຂາວ",
    "pricing.features.integrations": "ລາຟ ທໍາອິດ",
    "pricing.features.sla": "ໝາຍ SLA",
    "pricing.features.institutionalPricing": "ລາຄາ ສະກະ",
    "pricing.button": "ເລີ່ມຕົ້ນການລົງທຶນ",
    "trust.title": "ວິຊາຂອງທ່ານ, ບົດບາດ",
    "trust.security.name": "ສຸກロูບາລະ",
    "trust.security.desc": "ເຂົ້າລະຫັດ 256-bit ປົກປ້ອງ.",
    "trust.insured.name": "FDIC & SIPC",
    "trust.insured.desc": "ເງິນ ແລະ ປະກາດ ທ່ານ ປົກປ້ອງ.",
    "trust.compliant.name": "ບົດບາດ ແລະ ເປັນເຕັມ",
    "trust.compliant.desc": "ໍ່າຕັດ SEC ລະກວດ.",
    "cta.title": "ກະມາວຍ ເລີ່ມ?",
    "cta.subtitle": "ລາຄາ ຂາວ ເຄື່ອງມື.",
    "cta.button": "ຍົກສະກະ",
  }
};

// Function to create nested object from flat keys
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

// Fix corrupted files
console.log('🔧 Fixing corrupted translation files...\n');

Object.entries(translationMap).forEach(([langCode, translations]) => {
  // Create a copy of the English structure
  const langJson = JSON.parse(JSON.stringify(englishContent));
  
  // Apply  translations
  Object.entries(translations).forEach(([path, value]) => {
    setNestedValue(langJson, path, value);
  });
  
  // Write the file
  const filePath = path.join(LOCALES_DIR, `${langCode}.json`);
  fs.writeFileSync(filePath, JSON.stringify(langJson, null, 2), 'utf8');
  console.log(`✅ Fixed ${langCode}.json`);
});

console.log('\n✨ Translation fixes complete!');
