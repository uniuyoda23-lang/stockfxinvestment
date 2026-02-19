import { useTranslation } from 'react-i18next';
import { Globe, Search, X } from 'lucide-react';
import { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language);
  
  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-white hover:text-amber-400 transition text-sm">
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage?.flag}</span>
        <span className="hidden md:inline text-xs">{currentLanguage?.code.toUpperCase()}</span>
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-96 flex flex-col">
          {/* Search Header */}
          <div className="sticky top-0 p-3 border-b border-slate-700 bg-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                autoFocus
                type="text"
                placeholder="Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Languages List */}
          <div className="overflow-y-auto flex-1">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-700 transition text-sm ${
                    i18n.language === lang.code ? 'bg-amber-500/20 text-amber-400 border-l-2 border-amber-500' : 'text-slate-300'
                  }`}
                >
                  <span className="text-lg w-6">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-xs opacity-75">{lang.nativeName}</div>
                  </div>
                  <span className="text-xs opacity-50">{lang.code}</span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400 text-sm">
                No languages found
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="sticky bottom-0 p-2 border-t border-slate-700 bg-slate-800">
            <div className="text-xs text-slate-400 text-center">
              {filteredLanguages.length} of {SUPPORTED_LANGUAGES.length} languages
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
