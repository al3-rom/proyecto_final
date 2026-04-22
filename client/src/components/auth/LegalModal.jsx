import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

export default function LegalModal({ isOpen, onClose }) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(16,185,129,0.15)] relative">

                <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-[#111] hover:bg-zinc-800 rounded-full transition-colors outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 pr-8 drop-shadow-md">
                        {t('auth.legal.title')}
                    </h2>

                    <div className="space-y-6 text-zinc-400 font-medium leading-relaxed">
                        <p className="text-zinc-300 text-lg">{t('auth.legal.p1')}</p>

                        <ul className="space-y-5 pl-2 text-base">
                            <li className="flex items-start">
                                <span className="text-emerald-500 mr-3 mt-1.5 text-xl leading-none">✦</span>
                                <span>{t('auth.legal.li1')}</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-emerald-500 mr-3 mt-1.5 text-xl leading-none">✦</span>
                                <span>{t('auth.legal.li2')}</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-emerald-500 mr-3 mt-1.5 text-xl leading-none">✦</span>
                                <span>{t('auth.legal.li3')}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="p-6 bg-[#050505] border-t border-zinc-900 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-emerald-500/90 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-all active:scale-[0.98] border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                    >
                        {t('auth.legal.closeBtn')}
                    </button>
                </div>
            </div>
        </div>
    );
}
