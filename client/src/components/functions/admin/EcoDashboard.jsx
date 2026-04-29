import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Leaf, Ticket, Coins, TreeDeciduous, Zap, Globe, Droplets, Wind, X, ExternalLink, Info, Calculator } from "lucide-react";
import { fetchEcoStats } from "./thunks";

export default function EcoDashboard() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { ecoStats } = useSelector((state) => state.admin);
    const user = useSelector((state) => state.auth.user);
    const adminLocalId = user?.local_id;
    const [showCertifiedModal, setShowCertifiedModal] = useState(false);
    const [breakdownType, setBreakdownType] = useState(null);

    useEffect(() => {
        if (adminLocalId) dispatch(fetchEcoStats(adminLocalId));
    }, [dispatch, adminLocalId]);

    const totalPedidos = ecoStats?.totalPedidos || 0;
    const isFestival = ecoStats?.tipoLocal === 'festival';
    const papelGramos = ecoStats?.papelAhorradoGramos || 0;
    const plasticoGramos = ecoStats?.plasticoAhorradoGramos || 0;
    const aguaLitros = (ecoStats?.aguaAhorradaLitros || 0).toFixed(2);
    const co2Gramos = ecoStats?.co2AhorradoGramos || 0;
    const totalEcoScore = Math.floor((papelGramos * 2) + (plasticoGramos * 5) + (co2Gramos * 1));

    const multipliers = {
        paper: isFestival ? 0.5 : 1.5,
        plastic: isFestival ? 5.0 : 0.0,
        water: isFestival ? 0.01 : 0.05,
        co2: isFestival ? 4.0 : 1.5
    };

    return (
        <div className="p-4 md:p-10 pb-24 max-w-7xl mx-auto animate-in fade-in duration-700">
            <div className="mb-12 md:mb-16 text-center relative pt-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-24 w-[300px] md:w-[600px] h-[300px] md:h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none opacity-50"></div>
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-xl">
                    <Leaf size={14} className="animate-pulse" />
                    {t("nav.eco")}
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-4 leading-tight uppercase px-2">{t("admin.stats.dashboardTitle")}</h1>
                <p className="text-zinc-500 font-bold max-w-2xl mx-auto text-sm md:text-xl px-4 uppercase tracking-tight">{t("admin.stats.dashboardSubtitle")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12">
                <StatCard icon={<Ticket size={28} />} title={t("admin.stats.paper")} value={papelGramos >= 1000 ? (papelGramos/1000).toFixed(1) : papelGramos} unit={papelGramos >= 1000 ? t("admin.stats.unitKg") : t("admin.stats.unitGrams")} desc={t("admin.stats.paperDesc")} theme="emerald" onClick={() => setBreakdownType('paper')} />
                <StatCard icon={<Coins size={28} />} title={t("admin.stats.plastic")} value={plasticoGramos >= 1000 ? (plasticoGramos/1000).toFixed(1) : plasticoGramos} unit={plasticoGramos >= 1000 ? t("admin.stats.unitKg") : t("admin.stats.unitGrams")} desc={t("admin.stats.plasticDesc")} theme="purple" isEmpty={plasticoGramos === 0} onClick={() => setBreakdownType('plastic')} />
                <StatCard icon={<Droplets size={28} />} title={t("admin.stats.water")} value={aguaLitros} unit={t("admin.stats.unitLitros")} desc={t("admin.stats.waterDesc")} theme="blue" onClick={() => setBreakdownType('water')} />
                <StatCard icon={<Wind size={28} />} title={t("admin.stats.co2")} value={co2Gramos >= 1000 ? (co2Gramos/1000).toFixed(1) : co2Gramos} unit={co2Gramos >= 1000 ? t("admin.stats.unitKg") : t("admin.stats.unitGrams")} desc={t("admin.stats.co2Desc")} theme="white" onClick={() => setBreakdownType('co2')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden shadow-2xl">
                    <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <TreeDeciduous size={48} md:size={64} strokeWidth={1.5} />
                    </div>
                    <div className="relative z-10 text-center md:text-left">
                        <h4 className="text-2xl md:text-4xl font-black text-white mb-3 tracking-tighter uppercase">{t("admin.stats.commitmentTitle")}</h4>
                        <p className="text-zinc-500 leading-relaxed font-bold mb-8 text-sm md:text-lg">{t("admin.stats.commitmentDesc")}</p>
                        <div className="flex justify-center md:justify-start gap-12">
                            <div>
                                <p className="text-emerald-400 font-black text-3xl md:text-4xl mb-1 tracking-tighter uppercase">≈ {Math.floor(totalEcoScore / 100)}</p>
                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">{t("admin.stats.treesPreserved")}</p>
                            </div>
                            <div>
                                <p className="text-emerald-400 font-black text-3xl md:text-4xl mb-1 tracking-tighter uppercase">0%</p>
                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">{t("admin.stats.toxicWaste")}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div onClick={() => setShowCertifiedModal(true)} className="bg-emerald-500 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group cursor-pointer active:scale-95 transition-all">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center text-emerald-500 shadow-xl"><Zap size={32} fill="currentColor" /></div>
                            <div className="px-4 py-1.5 bg-zinc-950/20 rounded-full border border-zinc-950/10 text-[9px] font-black text-zinc-950 uppercase tracking-widest flex items-center gap-2">{t("admin.stats.certifiedLabel")} <Info size={14} /></div>
                        </div>
                        <h3 className="text-zinc-950/60 text-[10px] font-black uppercase tracking-widest mb-1">{t("admin.stats.globalScore")}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-7xl md:text-8xl font-black text-zinc-950 tracking-tighter leading-none">{totalEcoScore}</span>
                            <span className="text-lg md:text-2xl text-zinc-950/70 font-black uppercase tracking-tighter">pts</span>
                        </div>
                    </div>
                    <div className="relative z-10 pt-8 border-t border-zinc-950/10 mt-8 flex items-center gap-3 text-zinc-950 font-black text-[10px] uppercase tracking-widest"><Globe size={18} className="animate-spin-slow" />{t("admin.stats.positiveImpact")}</div>
                </div>
            </div>

            <div className="mt-16 border-t border-zinc-900 pt-12">
                <h5 className="text-zinc-700 font-black uppercase tracking-[0.4em] text-[10px] mb-10 text-center">{t("admin.stats.sourcesTitle")}</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                    <SourceCard url="https://www.greenamerica.org/skip-the-slip" title={t("admin.stats.source1")} desc={t("admin.stats.source1Desc")} color="emerald" />
                    <SourceCard url="https://environmentalpaper.org/" title={t("admin.stats.source2")} desc={t("admin.stats.source2Desc")} color="blue" />
                    <SourceCard url="https://www.agreenerfuture.com/" title={t("admin.stats.source3")} desc={t("admin.stats.source3Desc")} color="purple" />
                </div>
            </div>

            {breakdownType && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm bg-[#0a0a0a] border border-zinc-800 rounded-[2.5rem] p-8 shadow-3xl animate-in zoom-in-95">
                        <button onClick={() => setBreakdownType(null)} className="absolute top-8 right-8 text-zinc-600 hover:text-white"><X size={24} /></button>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><Calculator size={24} /></div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">{t("admin.stats.breakdownTitle")}</h3>
                                <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">{t("admin.stats.breakdownSubtitle")}</p>
                            </div>
                        </div>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-6 space-y-4 font-bold text-sm">
                            <div className="flex justify-between items-center"><span className="text-zinc-600 uppercase text-[10px]">{t("admin.stats.salesVolume")}</span><span className="text-white">{totalPedidos}</span></div>
                            <div className="flex justify-between items-center"><span className="text-zinc-600 uppercase text-[10px]">{t("admin.stats.multiplier")}</span><span className="text-emerald-500">x {multipliers[breakdownType]}</span></div>
                            <div className="h-px bg-zinc-800"></div>
                            <div className="flex justify-between items-center"><span className="text-emerald-500 uppercase text-[10px]">{t("admin.stats.totalSaved")}</span><span className="text-emerald-500 text-xl font-black">{breakdownType === 'paper' ? papelGramos : breakdownType === 'plastic' ? plasticoGramos : breakdownType === 'water' ? aguaLitros : co2Gramos} {breakdownType === 'water' ? 'L' : 'g'}</span></div>
                        </div>
                        <button onClick={() => setBreakdownType(null)} className="w-full py-4 bg-zinc-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-zinc-800">{t("admin.stats.closeBtn")}</button>
                    </div>
                </div>
            )}

            {showCertifiedModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm bg-[#0a0a0a] border border-zinc-800 rounded-[2.5rem] p-8 shadow-3xl animate-in zoom-in-95">
                        <button onClick={() => setShowCertifiedModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white"><X size={24} /></button>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t("admin.stats.certifiedLabel")}</h2>
                            <p className="text-emerald-500 font-black uppercase tracking-[0.2em] text-[9px] mt-1">{t("admin.stats.certifiedSubtitle")}</p>
                        </div>
                        <div className="space-y-4 mb-8">
                            <ModalFeature number="1" title={t("admin.stats.certifiedPillar1Title")} desc={t("admin.stats.certifiedPillar1Desc")} />
                            <ModalFeature number="2" title={t("admin.stats.certifiedPillar2Title")} desc={t("admin.stats.certifiedPillar2Desc")} />
                            <ModalFeature number="3" title={t("admin.stats.certifiedPillar3Title")} desc={t("admin.stats.certifiedPillar3Desc")} />
                        </div>
                        <button onClick={() => setShowCertifiedModal(false)} className="w-full py-4 bg-emerald-500 text-zinc-950 font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20">{t("admin.stats.closeBtn")}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, title, value, unit, desc, theme, isEmpty, onClick }) {
    const themes = {
        emerald: "bg-emerald-500/5 border-emerald-500/10 text-emerald-400",
        purple: "bg-purple-500/5 border-purple-500/10 text-purple-400",
        blue: "bg-blue-500/5 border-blue-500/10 text-blue-400",
        white: "bg-white/5 border-white/10 text-white"
    };
    return (
        <div onClick={onClick} className={`backdrop-blur-xl border rounded-[2.5rem] p-8 transition-all group cursor-pointer ${themes[theme]} ${isEmpty ? 'opacity-20 grayscale' : 'hover:bg-zinc-900/50 active:scale-95 shadow-xl'}`}>
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
            <div className="flex items-baseline gap-2 mb-4"><span className="text-5xl font-black text-white tracking-tighter leading-none">{value}</span><span className="text-sm text-zinc-700 font-black uppercase">{unit}</span></div>
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-tight leading-relaxed">{desc}</p>
        </div>
    );
}

function SourceCard({ url, title, desc, color }) {
    const colors = { emerald: "text-emerald-500", blue: "text-blue-500", purple: "text-purple-500" };
    return (
        <a href={url} target="_blank" rel="noreferrer" className="group block bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 transition-all hover:bg-zinc-900 shadow-lg">
            <div className="flex items-center justify-between mb-2">
                <p className={`text-[10px] font-black uppercase tracking-widest ${colors[color]}`}>{title}</p>
                <ExternalLink size={14} className="text-zinc-700 group-hover:text-white transition-colors" />
            </div>
            <p className="text-zinc-600 text-[10px] font-bold leading-relaxed">{desc}</p>
        </a>
    );
}

function ModalFeature({ number, title, desc }) {
    return (
        <div className="flex gap-4 items-start">
            <div className="w-7 h-7 shrink-0 bg-zinc-900 rounded-lg flex items-center justify-center text-emerald-500 font-black text-xs border border-zinc-800 mt-0.5">{number}</div>
            <div><h4 className="text-white font-black text-xs uppercase tracking-tight mb-0.5">{title}</h4><p className="text-zinc-600 text-[10px] leading-snug font-bold">{desc}</p></div>
        </div>
    );
}
