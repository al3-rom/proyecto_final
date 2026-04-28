import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Navigation, ShoppingBag, ArrowLeft, Filter, CheckCircle2, AlertCircle, X } from "lucide-react";
import { fetchLocales, fetchProductosByLocal, buyProducto } from "./thunks";
import { setSelectedLocal, clearSelectedLocal } from "./userSlice";

export default function Lugares() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { locales, localesStatus, selectedLocal, selectedLocalProducts } = useSelector((state) => state.user);
    const { user } = useSelector((state) => state.auth);

    const [searchTerm, setSearchTerm] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [streetFilter, setStreetFilter] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [notification, setNotification] = useState(null);

    const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

    useEffect(() => {
        if (localesStatus === "idle") {
            dispatch(fetchLocales());
        }
    }, [localesStatus, dispatch]);

    useEffect(() => {
        if (selectedLocal) {
            dispatch(fetchProductosByLocal(selectedLocal.id));
        }
    }, [selectedLocal, dispatch]);

    const handleSelectLocal = (local) => {
        dispatch(setSelectedLocal(local));
    };

    const handleBack = () => {
        dispatch(clearSelectedLocal());
        setProductSearch("");
    };

    const handleBuy = async (producto) => {
        try {
            const resultAction = await dispatch(buyProducto({ producto_id: producto.id, local_id: selectedLocal.id }));
            if (buyProducto.fulfilled.match(resultAction)) {
                setNotification({ type: "success", text: t("user.menu.purchaseSuccess") });
            } else {
                const errorMsg = resultAction.payload?.error ? t(resultAction.payload.error) : t("user.menu.purchaseError");
                setNotification({ type: "error", text: errorMsg });
            }
        } catch (error) {
            setNotification({ type: "error", text: t("user.menu.purchaseError") });
        }
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredLocales = locales.filter((l) => {
        const matchesName = (l.nombre || "").toLowerCase().includes(searchTerm.toLowerCase());
        if (!showFilters) return matchesName;
        
        return matchesName &&
            (l.ciudad || "").toLowerCase().includes(cityFilter.toLowerCase()) &&
            (l.calle || "").toLowerCase().includes(streetFilter.toLowerCase());
    });

    const filteredProducts = selectedLocalProducts.filter((p) => {
        const trans = p.Traduccion_productos?.find(tr => tr.codigo_idioma === i18n.language) || p.Traduccion_productos?.[0];
        return (trans?.nombre || "").toLowerCase().includes(productSearch.toLowerCase());
    });

    if (selectedLocal) {
        return (
            <div className="p-6 pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleBack}
                            className="p-3 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-2xl transition-all border border-zinc-800"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">{selectedLocal.nombre}</h1>
                            <p className="text-emerald-500 font-medium flex items-center gap-2">
                                <MapPin size={14} /> {selectedLocal.ciudad}, {selectedLocal.calle}
                            </p>
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 px-6 py-3 rounded-2xl border border-zinc-800 flex flex-col items-end">
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{t("perfil.balance")}</span>
                        <span className="text-2xl font-black text-white">{Number(user?.saldo).toFixed(2)}€</span>
                    </div>
                </div>

                <div className="relative mb-8">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={t("user.menu.searchPlaceholder")}
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <ShoppingBag size={20} className="text-emerald-500" />
                    {t("user.lugares.menuTitle")}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((producto) => {
                        const translation = producto.Traduccion_productos?.find(tr => tr.codigo_idioma === i18n.language) || producto.Traduccion_productos?.[0];
                        return (
                            <div key={producto.id} className="group bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                                <div className="aspect-square relative overflow-hidden">
                                    <img
                                        src={producto.foto_url ? `${BASE_URL}${producto.foto_url}` : "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"}
                                        alt={translation?.nombre}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60"></div>
                                    <div className="absolute top-4 right-4 bg-emerald-500 text-zinc-950 font-black px-4 py-2 rounded-xl shadow-lg">
                                        {Number(producto.precio).toFixed(2)}€
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{translation?.nombre}</h3>
                                    <p className="text-zinc-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{translation?.descripcion}</p>
                                    <button
                                        onClick={() => handleBuy(producto)}
                                        className="w-full py-4 bg-white hover:bg-emerald-500 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                                    >
                                        <ShoppingBag size={18} className="group-hover/btn:scale-110 transition-transform" />
                                        {t("user.menu.buyBtn")}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-zinc-900/20 rounded-[3rem] border border-dashed border-zinc-800">
                        <AlertCircle size={48} className="mx-auto text-zinc-700 mb-4" />
                        <p className="text-zinc-500 font-medium">{t("user.menu.noProducts")}</p>
                    </div>
                )}

                {notification && (
                    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-10 duration-300 z-50 ${notification.type === "success" ? "bg-emerald-500 text-zinc-950" : "bg-red-500 text-white"}`}>
                        {notification.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="font-bold">{notification.text}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-6 pb-24 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">{t("user.lugares.title")}</h1>
                    <div className="h-1.5 w-20 bg-emerald-500 rounded-full"></div>
                </div>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${showFilters ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800'}`}
                >
                    <Filter size={18} />
                    {t("user.lugares.filterBtn")}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={t("user.lugares.searchPlaceholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 transition-all duration-300 ${showFilters ? 'opacity-100 h-auto mb-8' : 'opacity-0 h-0 overflow-hidden pointer-events-none mb-0'}`}>
                <div className="relative">
                    <Navigation size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={t("user.lugares.cityPlaceholder")}
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
                <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={t("user.lugares.streetPlaceholder")}
                        value={streetFilter}
                        onChange={(e) => setStreetFilter(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
            </div>

            {localesStatus === "loading" && (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-zinc-500 font-medium animate-pulse">Cargando locales...</p>
                </div>
            )}

            {localesStatus === "failed" && (
                <div className="text-center py-32 bg-red-500/5 rounded-[3rem] border border-red-500/20">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <p className="text-red-500 font-bold text-xl mb-4">Error al cargar los locales</p>
                    <button 
                        onClick={() => dispatch(fetchLocales())}
                        className="px-8 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {localesStatus === "succeeded" && filteredLocales.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredLocales.map((local) => (
                        <div 
                            key={local.id} 
                            className="group relative bg-zinc-900/30 border border-zinc-800/50 rounded-[3rem] overflow-hidden hover:border-emerald-500/40 transition-all duration-700"
                        >
                            <div className="aspect-[4/5] relative overflow-hidden">
                                <img
                                    src={local.foto_url ? `${BASE_URL}${local.foto_url}` : "https://images.unsplash.com/photo-1566733971257-81c20d828c2e?q=80&w=1974&auto=format&fit=crop"}
                                    alt={local.nombre}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                                
                                <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-3xl font-black text-white mb-2">{local.nombre}</h3>
                                    <div className="flex flex-col gap-1 mb-6">
                                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                            <Navigation size={14} />
                                            <span className="text-sm uppercase tracking-widest">{local.ciudad}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <MapPin size={14} />
                                            <span className="text-sm font-medium">{local.calle}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSelectLocal(local)}
                                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                                    >
                                        {t("user.lugares.selectBtn")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {localesStatus === "succeeded" && filteredLocales.length === 0 && (
                <div className="text-center py-32">
                    <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                        <MapPin size={40} className="text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 text-xl font-bold">{t("user.lugares.noLocales")}</p>
                </div>
            )}
        </div>
    );
}



