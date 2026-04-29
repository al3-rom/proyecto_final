import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Navigation, ShoppingBag, ArrowLeft, Filter, CheckCircle2, AlertCircle, X, Calendar, Sparkles, ChevronRight, Percent } from "lucide-react";
import { fetchLocales, fetchProductosByLocal, buyProducto, fetchPromociones, claimPromocion } from "./thunks";
import { setSelectedLocal, clearSelectedLocal } from "./userSlice";
import { updateBalance } from "../../auth/authSlice";

export default function Lugares() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { locales, localesStatus, selectedLocal, selectedLocalProducts, promociones } = useSelector((state) => state.user);
    const { user } = useSelector((state) => state.auth);

    const [searchTerm, setSearchTerm] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [streetFilter, setStreetFilter] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [notification, setNotification] = useState(null);
    const [selectedPromo, setSelectedPromo] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL || "";
    const BASE_URL = apiUrl.replace("/api", "");

    useEffect(() => {
        if (localesStatus === "idle") {
            dispatch(fetchLocales());
        }
    }, [localesStatus, dispatch]);

    useEffect(() => {
        if (selectedLocal) {
            dispatch(fetchProductosByLocal(selectedLocal.id));
            dispatch(fetchPromociones(selectedLocal.id));
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
                if (resultAction.payload.nuevoSaldo !== undefined) {
                    dispatch(updateBalance(resultAction.payload.nuevoSaldo));
                }
            } else {
                const errorMsg = resultAction.payload?.error ? t(resultAction.payload.error) : t("user.menu.purchaseError");
                setNotification({ type: "error", text: errorMsg });
            }
        } catch (error) {
            setNotification({ type: "error", text: t("user.menu.purchaseError") });
        }
        setTimeout(() => setNotification(null), 3000);
    };

    const handleClaim = async (promoId) => {
        try {
            const resultAction = await dispatch(claimPromocion(promoId));
            if (claimPromocion.fulfilled.match(resultAction)) {
                setNotification({ type: "success", text: t("user.lugares.claimSuccess") || "¡Promoción canjeada!" });
                
                // Update balance if returned
                if (resultAction.payload.nuevoSaldo !== undefined) {
                    dispatch(updateBalance(resultAction.payload.nuevoSaldo));
                }

                setSelectedPromo(null);
            } else {
                const errorMsg = resultAction.payload === 'Limit reached for this promotion' ? (t("user.lugares.limitReached") || "Has alcanzado el límite para esta promo") : (t("user.lugares.claimError") || "Error al canjear");
                setNotification({ type: "error", text: errorMsg });
            }
        } catch (error) {
            setNotification({ type: "error", text: t("user.lugares.claimError") || "Error al canjear" });
        }
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredLocales = locales.filter((l) => {
        const matchesName = (l.nombre || "").toLowerCase().includes(searchTerm.toLowerCase());
        if (!showFilters) return matchesName;
        
        return matchesName &&
            (l.ciudad || "").toLowerCase().includes(cityFilter.toLowerCase()) &&
            (l.direccion || "").toLowerCase().includes(streetFilter.toLowerCase());
    });

    const filteredProducts = selectedLocalProducts.filter((p) => {
        const trans = p.Traduccion_productos?.find(tr => tr.codigo_idioma === i18n.language) || p.Traduccion_productos?.[0];
        return (trans?.nombre || "").toLowerCase().includes(productSearch.toLowerCase());
    });

    if (selectedLocal) {
        return (
            <div className="p-4 md:p-6 pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleBack}
                            className="p-3 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-2xl transition-all border border-zinc-800 active:scale-95"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="overflow-hidden">
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">{selectedLocal.nombre}</h1>
                            <p className="text-emerald-500 font-medium flex items-center gap-2 text-xs md:text-sm truncate">
                                <MapPin size={12} /> {selectedLocal.ciudad}, {selectedLocal.direccion}
                            </p>
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 px-5 py-3 rounded-2xl border border-zinc-800 flex flex-row md:flex-col items-center md:items-end justify-between">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t("perfil.balance")}</span>
                        <span className="text-xl md:text-2xl font-black text-white">{Number(user?.saldo).toFixed(2)}€</span>
                    </div>
                </div>

                <div className="relative mb-8">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={t("user.menu.searchPlaceholder")}
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm md:text-base"
                    />
                </div>

                {promociones && promociones.length > 0 && (
                    <div className="mb-12 animate-in slide-in-from-right-4 duration-700">
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles className="text-amber-400" size={24} />
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">{t("user.lugares.promosTitle") || "EVENTOS Y PROMOS"}</h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                            {promociones.map((promo) => (
                                <div 
                                    key={promo.id} 
                                    onClick={() => setSelectedPromo(promo)}
                                    className="min-w-[280px] md:min-w-[320px] bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden snap-start group shadow-xl cursor-pointer hover:border-amber-500/30 transition-all active:scale-[0.98]"
                                >
                                    <div className="h-40 relative">
                                        <img 
                                            src={promo.foto_url ? `${BASE_URL}${promo.foto_url}` : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"} 
                                            className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-110" 
                                            alt={promo.titulo} 
                                        />
                                        
                                        {promo.descuento > 0 && (
                                            <div className="absolute top-4 right-4 bg-amber-500 text-zinc-950 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1 shadow-lg z-10 animate-pulse">
                                                <Percent size={12} />
                                                -{promo.descuento}%
                                            </div>
                                        )}

                                        {promo.fecha_evento && (
                                            <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                                <Calendar size={12} className="text-emerald-400" />
                                                <span className="text-[10px] font-black text-white">{new Date(promo.fecha_evento).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight truncate">{promo.titulo}</h3>
                                        <p className="text-zinc-500 text-xs font-bold line-clamp-2 leading-relaxed mb-3">{promo.descripcion}</p>
                                        {promo.producto && (
                                            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-zinc-800">
                                                <ShoppingBag size={12} className="text-amber-500" />
                                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                                    {promo.producto.Traduccion_productos?.find(tr => tr.codigo_idioma === i18n.language)?.nombre || promo.producto.Traduccion_productos?.[0]?.nombre}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-10">
                    {filteredProducts.filter(p => p.tipo === 'guardarropa').length > 0 && (
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
                                <ShoppingBag size={20} className="text-purple-500" />
                                {t("user.menu.garderobeTitle")}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {filteredProducts.filter(p => p.tipo === 'guardarropa').map((producto) => {
                                    const translation = producto.Traduccion_productos?.find(tr => tr.codigo_idioma === i18n.language) || producto.Traduccion_productos?.[0];
                                    return (
                                        <div key={producto.id} className="group bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden hover:border-purple-500/30 transition-all duration-500 shadow-xl">
                                            <div className="aspect-square relative overflow-hidden">
                                                <img
                                                    src={producto.foto_url ? `${BASE_URL}${producto.foto_url}` : "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1974&auto=format&fit=crop"}
                                                    alt={translation?.nombre}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60"></div>
                                                <div className="absolute top-4 right-4 bg-purple-500 text-white font-black px-4 py-2 rounded-xl shadow-lg text-sm">
                                                    {Number(producto.precio).toFixed(2)}€
                                                </div>
                                            </div>
                                            <div className="p-5 md:p-6">
                                                <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-1">{translation?.nombre}</h3>
                                                <p className="text-zinc-500 text-xs md:text-sm mb-6 line-clamp-2 min-h-[32px] md:min-h-[40px]">{translation?.descripcion}</p>
                                                <button
                                                    onClick={() => handleBuy(producto)}
                                                    className="w-full py-3.5 md:py-4 bg-purple-500 hover:bg-purple-400 text-white font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                                                >
                                                    <ShoppingBag size={18} />
                                                    {t("user.menu.buyBtn")}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {filteredProducts.filter(p => (p.tipo || 'bebida') === 'bebida').length > 0 && (
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
                                <ShoppingBag size={20} className="text-emerald-500" />
                                {t("user.menu.drinksTitle")}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {filteredProducts.filter(p => (p.tipo || 'bebida') === 'bebida').map((producto) => {
                                    const translation = producto.Traduccion_productos?.find(tr => tr.codigo_idioma === i18n.language) || producto.Traduccion_productos?.[0];
                                    return (
                                        <div key={producto.id} className="group bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-500 shadow-xl">
                                            <div className="aspect-square relative overflow-hidden">
                                                <img
                                                    src={producto.foto_url ? `${BASE_URL}${producto.foto_url}` : "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"}
                                                    alt={translation?.nombre}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60"></div>
                                                <div className="absolute top-4 right-4 bg-emerald-500 text-zinc-950 font-black px-4 py-2 rounded-xl shadow-lg text-sm">
                                                    {Number(producto.precio).toFixed(2)}€
                                                </div>
                                            </div>
                                            <div className="p-5 md:p-6">
                                                <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-1">{translation?.nombre}</h3>
                                                <p className="text-zinc-500 text-xs md:text-sm mb-6 line-clamp-2 min-h-[32px] md:min-h-[40px]">{translation?.descripcion}</p>
                                                <button
                                                    onClick={() => handleBuy(producto)}
                                                    className="w-full py-3.5 md:py-4 bg-white hover:bg-emerald-500 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                                                >
                                                    <ShoppingBag size={18} />
                                                    {t("user.menu.buyBtn")}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-zinc-800">
                        <AlertCircle size={40} className="mx-auto text-zinc-700 mb-4" />
                        <p className="text-zinc-500 font-bold">{t("user.menu.noProducts")}</p>
                    </div>
                )}

                {notification && (
                    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-10 duration-300 z-50 w-[90%] max-w-sm ${notification.type === "success" ? "bg-emerald-500 text-zinc-950" : "bg-red-500 text-white"}`}>
                        {notification.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="font-bold text-sm">{notification.text}</span>
                    </div>
                )}

                {selectedPromo && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedPromo(null)}>
                        <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setSelectedPromo(null)} className="absolute top-6 right-6 z-20 text-zinc-400 hover:text-white bg-black/20 backdrop-blur-md p-2 rounded-xl transition-colors"><X size={20} /></button>
                            
                            <div className="aspect-video relative">
                                <img 
                                    src={selectedPromo.foto_url ? `${BASE_URL}${selectedPromo.foto_url}` : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"} 
                                    className="w-full h-full object-cover" 
                                    alt={selectedPromo.titulo} 
                                />
                                {selectedPromo.descuento > 0 && (
                                    <div className="absolute top-6 left-6 bg-amber-500 text-zinc-950 px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl">
                                        <Percent size={16} />
                                        -{selectedPromo.descuento}%
                                    </div>
                                )}
                            </div>

                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={12} />
                                        {selectedPromo.fecha_evento ? new Date(selectedPromo.fecha_evento).toLocaleDateString() : t("admin.promociones.noDate")}
                                    </div>
                                    {selectedPromo.limite_por_persona > 0 && (
                                        <div className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Hash size={12} />
                                            Limit: {selectedPromo.limite_por_persona}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">{selectedPromo.titulo}</h3>
                                <p className="text-zinc-400 text-sm font-bold leading-relaxed mb-8 bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800/50">{selectedPromo.descripcion}</p>
                                
                                {selectedPromo.producto && (
                                    <div className="mb-8 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-amber-500 text-zinc-950 rounded-xl shadow-lg"><ShoppingBag size={20} /></div>
                                            <div>
                                                <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-widest">{t("admin.promociones.productLabel")}</p>
                                                <p className="text-sm font-black text-white uppercase tracking-tight">
                                                    {selectedPromo.producto.Traduccion_productos?.find(tr => tr.codigo_idioma === i18n.language)?.nombre || selectedPromo.producto.Traduccion_productos?.[0]?.nombre}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {selectedPromo.descuento > 0 ? (
                                                <>
                                                    <p className="text-xs text-zinc-500 line-through">{selectedPromo.producto.precio}€</p>
                                                    <p className="text-xl font-black text-amber-500">
                                                        {(selectedPromo.producto.precio * (1 - selectedPromo.descuento / 100)).toFixed(2)}€
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-xl font-black text-amber-500">{selectedPromo.producto.precio}€</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedPromo.producto && (
                                    <button 
                                        onClick={() => handleClaim(selectedPromo.id)}
                                        className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-3xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-amber-500/20 uppercase tracking-widest text-xs"
                                    >
                                        <Sparkles size={20} />
                                        {t("user.lugares.claimBtn") || "CANJEAR PROMOCIÓN"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 pb-24 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">{t("user.lugares.title")}</h1>
                    <div className="h-1.5 w-16 md:w-20 bg-emerald-500 rounded-full"></div>
                </div>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all ${showFilters ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20' : 'bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800'}`}
                >
                    <Filter size={18} />
                    <span className="text-sm md:text-base">{t("user.lugares.filterBtn")}</span>
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
                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                    />
                </div>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 ${showFilters ? 'opacity-100 h-auto mb-8' : 'opacity-0 h-0 overflow-hidden pointer-events-none mb-0'}`}>
                <div className="relative">
                    <Navigation size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={t("user.lugares.cityPlaceholder")}
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                    />
                </div>
                <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={t("user.lugares.streetPlaceholder")}
                        value={streetFilter}
                        onChange={(e) => setStreetFilter(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                    />
                </div>
            </div>

            {localesStatus === "loading" && (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-zinc-500 font-bold animate-pulse text-sm md:text-base">{t("user.lugares.loading")}</p>
                </div>
            )}

            {localesStatus === "failed" && (
                <div className="text-center py-20 bg-red-500/5 rounded-[2.5rem] border border-red-500/20 px-6">
                    <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
                    <p className="text-red-500 font-black text-lg mb-6">Error al cargar los locales</p>
                    <button 
                        onClick={() => dispatch(fetchLocales())}
                        className="px-8 py-3.5 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all active:scale-95"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {localesStatus === "succeeded" && filteredLocales.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filteredLocales.map((local) => (
                        <div 
                            key={local.id} 
                            onClick={() => handleSelectLocal(local)}
                            className="group relative bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden hover:border-emerald-500/40 transition-all duration-700 cursor-pointer shadow-xl active:scale-[0.98]"
                        >
                            <div className="aspect-[4/5] relative overflow-hidden">
                                <img
                                    src={local.foto ? `${BASE_URL}${local.foto}` : "https://images.unsplash.com/photo-1566733971257-81c20d828c2e?q=80&w=1974&auto=format&fit=crop"}
                                    alt={local.nombre}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                                
                                {local.promociones && local.promociones.length > 0 && (
                                    <div className="absolute top-6 left-6 bg-amber-500 text-zinc-950 p-3 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-bounce z-10">
                                        <Sparkles size={20} className="fill-current" />
                                    </div>
                                )}
                                
                                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-2xl md:text-3xl font-black text-white mb-2 truncate">{local.nombre}</h3>
                                    <div className="flex flex-col gap-1 mb-6">
                                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                            <Navigation size={12} />
                                            <span className="text-[10px] md:text-xs uppercase tracking-widest">{local.ciudad}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <MapPin size={12} />
                                            <span className="text-[10px] md:text-xs font-bold truncate">{local.direccion}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSelectLocal(local)}
                                        className="w-full py-3.5 md:py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <span className="text-sm">{t("user.lugares.selectBtn")}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {localesStatus === "succeeded" && filteredLocales.length === 0 && (
                <div className="text-center py-32">
                    <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                        <MapPin size={32} className="text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 text-lg font-black">{t("user.lugares.noLocales")}</p>
                </div>
            )}
        </div>
    );
}
