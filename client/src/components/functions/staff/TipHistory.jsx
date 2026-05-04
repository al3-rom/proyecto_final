import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ChevronLeft, TrendingUp, Calendar, Clock, User } from "lucide-react";
import { fetchTipHistory } from "../thunks";

export default function TipHistory() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useSelector((state) => state.auth);
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);

    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");

    useEffect(() => {
        dispatch(fetchTipHistory())
            .unwrap()
            .then((data) => setTips(data))
            .catch((e) => console.error(e))
            .finally(() => setLoading(false));
    }, [dispatch]);

    const totalRecibido = tips.reduce((sum, tip) => sum + Number(tip.propina), 0);

    const groupedByDate = tips.reduce((acc, tip) => {
        const date = new Date(tip.validated_at).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(tip);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-14 h-14 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px] animate-pulse">
                    {t("user.bebidas.loading")}
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 pb-28 md:pb-12 animate-in fade-in duration-500">
            <div className="mt-4 mb-8">
                <button
                    onClick={() => navigate("/perfil")}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black uppercase tracking-widest text-[10px]">
                        {t("user.bebidas.backToList")}
                    </span>
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                        <Heart size={20} fill="currentColor" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
                        {t("perfil.tipHistory")}
                    </h1>
                </div>
                <p className="text-zinc-500 text-sm font-bold ml-13 pl-1">
                    {tips.length === 0
                        ? t("perfil.noTips")
                        : `${tips.length} ${t("perfil.tipHistory").toLowerCase()}`}
                </p>
            </div>

            {tips.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <div className="sm:col-span-1 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between">
                        <p className="text-[9px] font-black text-emerald-400/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <TrendingUp size={12} /> {t("perfil.tipTotal")}
                        </p>
                        <p className="text-4xl font-black text-white leading-none">
                            +{totalRecibido.toFixed(2)}
                            <span className="text-emerald-400 text-2xl">€</span>
                        </p>
                    </div>
                    <div className="sm:col-span-1 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6 flex flex-col justify-between">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Heart size={12} /> {t("perfil.tipHistory")}
                        </p>
                        <p className="text-4xl font-black text-white leading-none">{tips.length}</p>
                    </div>
                    <div className="sm:col-span-1 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6 flex flex-col justify-between">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <TrendingUp size={12} /> MEDIA
                        </p>
                        <p className="text-4xl font-black text-white leading-none">
                            {(totalRecibido / tips.length).toFixed(2)}
                            <span className="text-zinc-400 text-2xl">€</span>
                        </p>
                    </div>
                </div>
            )}

            {tips.length === 0 ? (
                <div className="text-center py-24 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[3rem] px-6">
                    <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                        <Heart size={32} className="text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 text-lg font-black uppercase tracking-tight">
                        {t("perfil.noTips")}
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedByDate).map(([date, dayTips]) => (
                        <div key={date}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
                                    <Calendar size={11} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{date}</span>
                                </div>
                                <div className="h-px flex-1 bg-zinc-800/60"></div>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                    +{dayTips.reduce((s, t) => s + Number(t.propina), 0).toFixed(2)}€
                                </span>
                            </div>

                            <div className="space-y-3">
                                {dayTips.map((tip) => (
                                    <div
                                        key={tip.id}
                                        className="group flex items-center gap-4 p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0 shadow-lg">
                                            {tip.usuario?.foto_perfil_url ? (
                                                <img
                                                    src={
                                                        tip.usuario.foto_perfil_url.startsWith("http")
                                                            ? tip.usuario.foto_perfil_url
                                                            : `${baseUrl}${tip.usuario.foto_perfil_url.startsWith("/") ? "" : "/"}${tip.usuario.foto_perfil_url}`
                                                    }
                                                    alt={tip.usuario?.nombre}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-emerald-400 font-black text-lg uppercase">
                                                    {tip.usuario?.nombre?.[0] || "?"}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-white uppercase tracking-tight truncate flex items-center gap-2">
                                                <User size={12} className="text-zinc-500 shrink-0" />
                                                {tip.usuario?.nombre || "—"}
                                            </p>
                                            <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 mt-1">
                                                <Clock size={10} className="text-zinc-600" />
                                                {new Date(tip.validated_at).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <p className="text-xl font-black text-emerald-400">
                                                +{Number(tip.propina).toFixed(2)}€
                                            </p>
                                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                                <Heart size={9} className="text-emerald-500/60" fill="currentColor" />
                                                <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">TIP</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
