import { useNavigate } from "react-router-dom";
import { AlertTriangle, Home as HomeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Error() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 font-sans animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
                <AlertTriangle className="w-32 h-32 text-emerald-500 relative z-10 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" strokeWidth={1} />
            </div>
            
            <h1 className="text-7xl font-black tracking-tighter text-white mb-2 drop-shadow-lg drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{t('error.title')}</h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-4 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">{t('error.accessDenied')}</h2>
            <p className="text-zinc-500 md:text-lg max-w-md mx-auto mb-10 font-medium">
                {t('error.description')}
            </p>

            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-8 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 hover:border-emerald-400 text-emerald-400 font-bold rounded-[2rem] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95"
            >
                <HomeIcon size={20} />
                <span>{t('error.backBtn')}</span>
            </button>
        </div>
    );
}



