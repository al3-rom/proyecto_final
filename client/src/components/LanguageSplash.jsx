import { useTranslation } from 'react-i18next';

export default function LanguageSplash({ onComplete }) {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'es', name: 'Español', flag: '🇪🇸', greeting: 'Bienvenido' },
        { code: 'en', name: 'English', flag: '🇬🇧', greeting: 'Welcome' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺', greeting: 'Добро пожаловать' },
    ];

    const handleSelect = (langCode) => {
        i18n.changeLanguage(langCode);
        localStorage.setItem('languageSelected', 'true');
        onComplete();
    };

    const marqueeText = "Welcome • Bienvenido • Добро пожаловать • ".repeat(10);

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center overflow-hidden font-sans">
            <div className="absolute top-[30%] w-[200%] overflow-hidden opacity-10 pointer-events-none select-none flex">
                <div className="animate-marquee whitespace-nowrap flex shrink-0">
                    <span className="text-[5rem] md:text-[6rem] font-extrabold tracking-tight text-emerald-500 pr-8">{marqueeText}</span>
                    <span className="text-[5rem] md:text-[6rem] font-extrabold tracking-tight text-emerald-500">{marqueeText}</span>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
                <div className="mb-16 text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        Select your language
                    </h1>
                    <p className="text-zinc-500 text-lg md:text-xl font-medium">Choose your preferred language to begin</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className="group relative flex flex-col items-center justify-center p-8 bg-[#0a0a0a] rounded-[2rem] border border-zinc-800 hover:border-emerald-500/50 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] focus:outline-none"
                        >
                            <div className="absolute inset-0 rounded-[2rem] bg-emerald-500 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500"></div>

                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{lang.flag}</span>
                            <span className="text-xl font-bold text-white mb-1 tracking-wide">{lang.name}</span>
                            <span className="text-sm font-medium text-emerald-400/80 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">{lang.greeting}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black"></div>
        </div>
    );
}
