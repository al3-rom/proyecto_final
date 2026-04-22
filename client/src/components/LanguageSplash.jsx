import { useTranslation } from 'react-i18next';

export default function LanguageSplash({ onComplete }) {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'es', name: 'Español', flagClass: 'fi-es', greeting: 'Bienvenido' },
        { code: 'en', name: 'English', flagClass: 'fi-gb', greeting: 'Welcome' },
        { code: 'ru', name: 'Русский', flagClass: 'fi-ru', greeting: 'Добро пожаловать' },
    ];

    const handleSelect = (langCode) => {
        i18n.changeLanguage(langCode);
        localStorage.setItem('languageSelected', 'true');
        onComplete();
    };

    const marqueeText = "Welcome • Bienvenido • Добро пожаловать • ".repeat(10);

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center overflow-hidden font-sans">
            <div className="absolute top-[8%] md:top-[12%] left-0 w-[200vw] overflow-hidden opacity-[0.10] pointer-events-none select-none flex">
                <div className="animate-marquee whitespace-nowrap flex shrink-0">
                    <span className="text-[3rem] md:text-[5rem] font-extrabold tracking-tight text-emerald-500 pr-8">{marqueeText}</span>
                    <span className="text-[3rem] md:text-[5rem] font-extrabold tracking-tight text-emerald-500">{marqueeText}</span>
                </div>
            </div>

            <div className="absolute top-[40%] md:top-[40%] left-0 w-[200vw] overflow-hidden opacity-[0.10] pointer-events-none select-none flex">
                <div className="animate-marquee-reverse whitespace-nowrap flex shrink-0">
                    <span className="text-[5rem] md:text-[8rem] font-extrabold tracking-tight text-emerald-500 pr-8">{marqueeText}</span>
                    <span className="text-[5rem] md:text-[8rem] font-extrabold tracking-tight text-emerald-500">{marqueeText}</span>
                </div>
            </div>

            <div className="absolute bottom-[2%] md:bottom-[6%] left-0 w-[200vw] overflow-hidden opacity-[0.15] md:opacity-10 pointer-events-none select-none flex">
                <div className="animate-marquee-fast whitespace-nowrap flex shrink-0">
                    <span className="text-[4rem] md:text-[6rem] font-extrabold tracking-tight text-emerald-500 pr-8">{marqueeText}</span>
                    <span className="text-[4rem] md:text-[6rem] font-extrabold tracking-tight text-emerald-500">{marqueeText}</span>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
                <div className="mb-10 sm:mb-16 text-center space-y-2 sm:space-y-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-1 sm:mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        Select your language
                    </h1>
                    <p className="text-zinc-500 text-base sm:text-lg md:text-xl font-medium">Choose your preferred language to begin</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 w-full max-w-3xl lg:px-0">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className="group relative flex flex-col items-center justify-center p-5 sm:p-8 bg-[#0a0a0a] rounded-3xl sm:rounded-[2rem] border border-zinc-800 hover:border-emerald-500/50 transition-all duration-500 ease-out hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] focus:outline-none"
                        >
                            <div className="absolute inset-0 rounded-3xl sm:rounded-[2rem] bg-emerald-500 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500"></div>

                            <span className={`fi ${lang.flagClass} text-4xl sm:text-5xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-md rounded-sm`}></span>
                            <span className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1 tracking-wide">{lang.name}</span>
                            <span className="text-xs sm:text-sm font-medium text-emerald-400/80 bg-emerald-950/40 px-2 sm:px-3 py-1 rounded-full border border-emerald-500/20 mt-1 sm:mt-2 opacity-80 group-hover:opacity-100 transition-opacity">{lang.greeting}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black"></div>
        </div>
    );
}
