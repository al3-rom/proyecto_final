import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders, addTip, transferOrder, sellBackOrders } from "./thunks";
import { useTranslation } from "react-i18next";
import { Beer, MapPin, QrCode, ChevronLeft, Info, CheckCircle, Clock, Heart, Gift, X, AlertCircle, Tag, CheckSquare, Square, DollarSign, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ListaBebidas() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { orders, ordersStatus } = useSelector((state) => state.user);
    const { user } = useSelector((state) => state.auth);
    const saldo = Number(user?.saldo || 0).toFixed(2);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [view, setView] = useState("list");
    const [selectedLocalId, setSelectedLocalId] = useState(null);
    const [activeTab, setActiveTab] = useState("available");
    const [giftModalOpen, setGiftModalOpen] = useState(false);
    const [friendEmail, setFriendEmail] = useState("");
    const [transferLoading, setTransferLoading] = useState(false);
    const [transferMsg, setTransferMsg] = useState({ type: '', text: '' });
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [sellLoading, setSellLoading] = useState(false);
    const [manualTip, setManualTip] = useState("");
    const tipDebounceRef = useRef(null);

    const handleAddTipDebounced = useCallback((orderId, amount) => {
        if (tipDebounceRef.current) clearTimeout(tipDebounceRef.current);
        tipDebounceRef.current = setTimeout(() => {
            dispatch(addTip({ orderId, amount }));
        }, 600);
    }, [dispatch]);

    useEffect(() => {
        if (ordersStatus === "idle") {
            dispatch(fetchMyOrders());
        }
    }, [dispatch, ordersStatus]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                dispatch(fetchMyOrders());
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [dispatch]);

    useEffect(() => {
        let interval;
        if (view === "qr" && selectedOrder) {
            interval = setInterval(() => {
                dispatch(fetchMyOrders());
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [view, selectedOrder, dispatch]);

    useEffect(() => {
        if (view === "qr" && selectedOrder) {
            const updated = orders.find(o => o.id === selectedOrder.id);
            if (updated && (updated.estado === "Entregado" || updated.estado === "Recogido")) {
                setView("list");
                setTransferMsg({ type: 'success', text: t("user.bebidas.validationSuccess") || "¡Consumición validada con éxito!" });
                setTimeout(() => setTransferMsg({ type: '', text: '' }), 3000);
            }
        }
    }, [orders, selectedOrder, view, t]);

    const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

    const getProductName = (order) => {
        const lang = i18n.language;
        const traducciones = order.producto?.Traduccion_productos;
        const trad = traducciones?.find(t => t.codigo_idioma === lang)
            || traducciones?.find(t => t.codigo_idioma === 'es');
        return trad?.nombre || "Producto";
    };

    const getProductDesc = (order) => {
        const lang = i18n.language;
        const traducciones = order.producto?.Traduccion_productos;
        const trad = traducciones?.find(t => t.codigo_idioma === lang)
            || traducciones?.find(t => t.codigo_idioma === 'es');
        return trad?.descripcion || "";
    };

    const handleTransfer = async () => {
        if (!friendEmail) return;
        setTransferLoading(true);
        setTransferMsg({ type: '', text: '' });
        try {
            await dispatch(transferOrder({ orderId: selectedOrder.id, targetEmail: friendEmail })).unwrap();
            setTransferMsg({ type: 'success', text: t("user.bebidas.transferSuccess") || "¡Consumición enviada con éxito!" });
            setTimeout(() => {
                setGiftModalOpen(false);
                setFriendEmail("");
                setTransferMsg({ type: '', text: '' });
                dispatch(fetchMyOrders());
            }, 2000);
        } catch (error) {
            setTransferMsg({ type: 'error', text: t(error) || "Error al transferir" });
        } finally {
            setTransferLoading(false);
        }
    };

    const handleAddTip = (orderId, amount) => {
        dispatch(addTip({ orderId, amount }));
    };

    const handleSellBack = async () => {
        if (selectedIds.length === 0) return;
        setSellLoading(true);
        try {
            await dispatch(sellBackOrders(selectedIds)).unwrap();
            setSelectionMode(false);
            setSelectedIds([]);
            setTransferMsg({ type: 'success', text: t("user.bebidas.sellSuccess") || "¡Bebidas vendidas!" });
            setTimeout(() => setTransferMsg({ type: '', text: '' }), 3000);
            dispatch(fetchMyOrders());
        } catch (error) {
            setTransferMsg({ type: 'error', text: t(error) || "Error al vender" });
        } finally {
            setSellLoading(false);
        }
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const calculateTotalRefund = () => {
        const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
        return selectedOrders.reduce((sum, order) => {
            const basePrice = order.precio_pagado || order.producto?.precio || 0;
            return sum + (basePrice * 0.45);
        }, 0).toFixed(2);
    };

    if (ordersStatus === "loading") {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 font-bold animate-pulse">{t("user.bebidas.loading")}</p>
            </div>
        );
    }

    if (view === "qr" && selectedOrder) {
        const currentOrder = orders.find(o => o.id === selectedOrder.id) || selectedOrder;
        return (
            <div
                className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
                onClick={() => setView("list")}
            >
                <div
                    className="max-w-sm w-full animate-in zoom-in-95 duration-300 my-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setView("list")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors group px-2"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black uppercase tracking-widest text-[10px]">{t("user.bebidas.backToList")}</span>
                    </button>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-5 sm:p-6 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full"></div>

                        <h2 className="text-xl sm:text-2xl font-black text-white mb-1">{t("user.bebidas.qrTitle")}</h2>
                        <p className="text-zinc-500 text-[10px] font-bold leading-tight mb-4">{t("user.bebidas.qrSubtitle")}</p>

                        <div className="bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] inline-block mb-6 shadow-xl">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${currentOrder.qr_code}`}
                                alt="QR Code"
                                className="w-40 h-40 sm:w-56 sm:h-56 object-contain"
                            />
                        </div>

                        <div className="bg-zinc-950/50 rounded-2xl p-4 sm:p-6 border border-zinc-800/50 mb-5">
                            <p className="text-emerald-400 font-black text-lg sm:text-xl mb-1">{getProductName(currentOrder)}</p>
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-2">
                                <MapPin size={12} /> {currentOrder.local?.nombre}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.2em]">{t("user.bebidas.addTip") || "DEJAR PROPINA"}</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[0.5, 1, 2].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => {
                                            const newVal = Number(currentOrder.propina) === val ? 0 : val;
                                            handleAddTip(currentOrder.id, newVal);
                                            if (newVal === 0) setManualTip("");
                                        }}
                                        className={`py-2.5 rounded-xl font-black text-[10px] transition-all border ${Number(currentOrder.propina) === val ? 'bg-emerald-500 text-zinc-950 border-emerald-500' : 'bg-zinc-950 text-white border-zinc-800 hover:border-emerald-500/50'}`}
                                    >
                                        {val}€
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={manualTip}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setManualTip(val);
                                        handleAddTipDebounced(currentOrder.id, val === "" ? 0 : parseFloat(val) || 0);
                                    }}
                                    placeholder={t("user.bebidas.manualTip") || "Otras cantidades..."}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 text-[11px] font-bold pl-10 transition-all shadow-inner"
                                />
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
                                    <Heart size={14} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === "detail" && selectedOrder) {
        const currentOrder = orders.find(o => o.id === selectedOrder.id) || selectedOrder;
        return (
            <div
                className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
                onClick={() => setView("list")}
            >
                <div
                    className="max-w-sm w-full animate-in slide-in-from-bottom-10 duration-300 my-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setView("list")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors group px-2"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black uppercase tracking-widest text-[10px]">{t("user.bebidas.backToList")}</span>
                    </button>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl relative">
                        <div className="aspect-square sm:aspect-video relative">
                            <img
                                src={currentOrder.producto?.foto_url ? `${BASE_URL}${currentOrder.producto.foto_url}` : "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"}
                                alt={getProductName(currentOrder)}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <h2 className="text-2xl font-black text-white truncate">{getProductName(currentOrder)}</h2>
                                <span className={`shrink-0 px-4 py-1.5 border text-[9px] font-black uppercase tracking-widest rounded-full ${currentOrder.estado === "Entregado" ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
                                    {currentOrder.estado === "Entregado" ? t("user.bebidas.statusEntregado") : t("user.bebidas.statusPendiente")}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-zinc-400 mb-6">
                                <MapPin size={14} className="text-emerald-500" />
                                <span className="text-xs font-black uppercase tracking-wide">{currentOrder.local?.nombre}</span>
                            </div>

                            <div className="mb-8">
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">{t("user.bebidas.descriptionLabel")}</p>
                                <p className="text-zinc-400 leading-relaxed text-sm">{getProductDesc(currentOrder)}</p>
                            </div>

                            {currentOrder.estado !== "Entregado" && currentOrder.local_id !== null && (
                                <button
                                    onClick={() => setView("qr")}
                                    className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
                                >
                                    <QrCode size={24} />
                                    {t("user.bebidas.useBtn")}
                                </button>
                            )}
                            {currentOrder.local_id === null && currentOrder.estado === "Pendiente" && (
                                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                                    <AlertCircle className="text-red-500" size={20} />
                                    <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{t("user.bebidas.statusNotConsumed")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const filteredOrders = orders.filter(order => {
        if (order.estado === "Reembolsado") return false;
        return activeTab === "available"
            ? (order.estado !== "Entregado" && order.estado !== "Recogido" && order.local_id !== null)
            : (order.estado === "Entregado" || order.estado === "Recogido" || order.local_id === null);
    });

    const groupedOrders = filteredOrders.reduce((acc, order) => {
        const localId = order.local_id || "deleted";
        if (!acc[localId]) {
            acc[localId] = {
                id: localId,
                nombre: order.local?.nombre || (activeTab === "history" ? t("user.bebidas.historyGeneral") || "HISTORIAL GENERAL" : t("user.bebidas.venueClosed") || "LOCAL CERRADO"),
                foto: order.local?.foto || "",
                ciudad: order.local?.ciudad || "",
                calle: order.local?.direccion || "",
                pedidos: []
            };
        }
        acc[localId].pedidos.push(order);
        return acc;
    }, {});

    const groups = Object.values(groupedOrders);

    return (
        <div className="max-w-6xl mx-auto px-4 pb-40 md:pb-12 animate-in fade-in duration-500">
            <div className="mb-10 mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase">{t("user.bebidas.title")}</h1>
                    <p className="text-zinc-500 font-bold text-sm md:text-base">{t("user.bebidas.subtitle")}</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl flex items-center gap-4 shadow-xl">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">{t("user.lugares.balance") || "SALDO DISPONIBLE"}</p>
                        <p className="text-xl font-black text-white leading-none">{saldo}€</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 p-1.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl w-full sm:w-fit mb-10 overflow-x-auto">
                <button
                    onClick={() => { setActiveTab("available"); setSelectedLocalId(null); }}
                    className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "available" ? "bg-emerald-500 text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-white"}`}
                >
                    {t("user.bebidas.tabAvailable")}
                </button>
                <button
                    onClick={() => { setActiveTab("history"); setSelectedLocalId(null); }}
                    className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "history" ? "bg-emerald-500 text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-white"}`}
                >
                    {t("user.bebidas.tabHistory")}
                </button>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[3rem] px-6">
                    <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                        <Beer size={32} className="text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 text-lg font-black mb-8 leading-tight">{t("user.bebidas.noOrders")}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full sm:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 shadow-lg"
                    >
                        {t("user.bebidas.buyMore")}
                    </button>
                </div>
            ) : selectedLocalId === null ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            onClick={() => setSelectedLocalId(group.id)}
                            className="group relative bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden hover:border-emerald-500/40 transition-all duration-700 cursor-pointer shadow-xl active:scale-[0.98]"
                        >
                            <div className="aspect-[4/5] relative overflow-hidden">
                                <img
                                    src={group.foto ? `${BASE_URL}${group.foto}` : "https://images.unsplash.com/photo-1566733971257-81c20d828c2e?q=80&w=1974&auto=format&fit=crop"}
                                    alt={group.nombre}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>

                                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                                    <h3 className="text-2xl md:text-3xl font-black text-white mb-2 truncate">{group.nombre}</h3>
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold mb-6">
                                        <MapPin size={12} />
                                        <span className="text-[10px] uppercase tracking-widest">{group.ciudad}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white text-[10px] font-black border border-white/10 uppercase tracking-tight">
                                            {group.pedidos.length} {t("nav.bebidas")}
                                        </span>
                                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-zinc-950 shadow-lg">
                                            <ChevronLeft className="rotate-180" size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <button
                        onClick={() => setSelectedLocalId(null)}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group px-2"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black uppercase tracking-widest text-[10px]">{t("user.lugares.backToList")}</span>
                    </button>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
                        <div className="flex items-center gap-3">
                            <MapPin className="text-emerald-500 shrink-0" size={24} />
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight truncate max-w-[200px] sm:max-w-none">
                                {groupedOrders[selectedLocalId].nombre}
                            </h2>
                        </div>
                        <button
                            onClick={() => { setSelectionMode(!selectionMode); setSelectedIds([]); }}
                            className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl transition-all border font-black text-[10px] uppercase tracking-widest ${selectionMode ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-zinc-900 text-white border-zinc-800 hover:border-emerald-500/50'}`}
                        >
                            {selectionMode ? <X size={16} /> : <Tag size={16} />}
                            {selectionMode ? t("user.bebidas.backToList") : t("user.bebidas.sellBtn")}
                        </button>
                    </div>

                    {selectionMode && (
                        <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-500 text-zinc-950 rounded-2xl flex items-center justify-center shadow-lg"><Info size={24} /></div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">{t("user.bebidas.selectionMode")}</h3>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{t("user.bebidas.refundRate")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 bg-zinc-950/50 rounded-xl text-[10px] font-black text-amber-500 border border-amber-500/20 uppercase tracking-tighter">
                                    {selectedIds.length} {t("nav.bebidas")} {t("user.bebidas.selectedLabel") || "SELECCIONADAS"}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {groupedOrders[selectedLocalId].pedidos.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => selectionMode ? (order.estado === 'Pendiente' && order.local_id !== null ? toggleSelection(order.id) : null) : null}
                                className={`group bg-zinc-900/30 border rounded-[2rem] overflow-hidden transition-all duration-500 shadow-xl relative ${selectionMode ? (selectedIds.includes(order.id) ? 'border-amber-500 bg-amber-500/5 scale-[0.98]' : (order.estado === 'Pendiente' && order.local_id !== null ? 'border-zinc-800 cursor-pointer hover:border-amber-500/30' : 'border-zinc-800 opacity-40 grayscale cursor-not-allowed')) : 'border-zinc-800/50 hover:border-emerald-500/40'}`}
                            >
                                {selectionMode && selectedIds.includes(order.id) && (
                                    <div className="absolute inset-0 bg-amber-500/5 z-10 pointer-events-none border-4 border-amber-500 rounded-[2rem]"></div>
                                )}
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={order.producto?.foto_url ? `${BASE_URL}${order.producto.foto_url}` : "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"}
                                        alt={getProductName(order)}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>

                                    {selectionMode && order.estado === 'Pendiente' && order.local_id !== null && (
                                        <div className="absolute top-4 left-4 z-20">
                                            {selectedIds.includes(order.id) ? (
                                                <div className="bg-amber-500 text-zinc-950 p-2 rounded-xl shadow-lg animate-in zoom-in-50"><CheckSquare size={20} /></div>
                                            ) : (
                                                <div className="bg-black/50 backdrop-blur-md text-white/50 p-2 rounded-xl border border-white/10"><Square size={20} /></div>
                                            )}
                                        </div>
                                    )}

                                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${order.estado === 'Entregado' || order.estado === 'Recogido'
                                            ? 'bg-zinc-800/90 text-zinc-500 backdrop-blur-md'
                                            : order.estado === 'En Guardarropa'
                                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                                                : 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                                            }`}>
                                            {order.local_id === null && order.estado === 'Pendiente' ? <X size={10} className="text-red-500" /> : (order.estado === 'Entregado' || order.estado === 'Recogido') ? <CheckCircle size={10} /> : <Clock size={10} />}
                                            {order.local_id === null && order.estado === 'Pendiente' && (t("user.bebidas.statusNotConsumed") || "NO CONSUMIDO / LOCAL CERRADO")}
                                            {order.estado === 'Entregado' && t("user.bebidas.statusEntregado")}
                                            {order.estado === 'Recogido' && t("user.bebidas.statusPickedUp")}
                                            {order.estado === 'En Guardarropa' && t("user.bebidas.statusInGarderobe")}
                                            {order.estado === 'Pendiente' && order.local_id !== null && t("user.bebidas.statusPendiente")}
                                        </span>
                                        {Number(order.propina) > 0 && (
                                            <span className="bg-amber-500 text-zinc-950 px-2 py-1 rounded-lg text-[8px] font-black flex items-center gap-1">
                                                <Heart size={10} fill="currentColor" /> +{order.propina}€
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-black text-white mb-4 truncate uppercase tracking-tight">{getProductName(order)}</h3>

                                    {order.estado === 'Entregado' && order.validated_at && (
                                        <div className="mb-6 p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{t("user.bebidas.consumedOn")}</span>
                                                <span className="text-xs text-white font-bold">
                                                    {new Date(order.validated_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{t("user.bebidas.timeLabel") || "HORA"}</span>
                                                <span className="text-xs text-white font-bold">
                                                    {new Date(order.validated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{t("user.bebidas.pricePaid") || "PRECIO PAGADO"}</span>
                                                <span className="text-xs text-amber-500 font-black">
                                                    {order.precio_pagado ? `${order.precio_pagado}€` : `${order.producto?.precio}€`}
                                                </span>
                                            </div>
                                            {order.staff?.nombre && (
                                                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                                                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{t("user.bebidas.attendedBy")}</span>
                                                    <span className="text-xs text-emerald-400 font-black truncate max-w-[120px] text-right">{order.staff.nombre}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!selectionMode && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => { setSelectedOrder(order); setView("detail"); }}
                                                className="py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <Info size={16} />
                                                {t("user.bebidas.detailBtn")}
                                            </button>
                                            {(order.estado !== "Entregado" && order.estado !== "Recogido" && order.local_id !== null) && (
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setView("qr"); }}
                                                    className="py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                                                >
                                                    <QrCode size={16} />
                                                    {t("user.bebidas.useBtn")}
                                                </button>
                                            )}
                                            {(order.estado !== "Entregado" && order.estado !== "Recogido" && order.local_id !== null) && (
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setGiftModalOpen(true); }}
                                                    className="col-span-2 py-3 bg-zinc-950 hover:bg-zinc-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                                                >
                                                    <Gift size={14} className="text-emerald-500" />
                                                    {t("user.bebidas.giftBtn")}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectionMode && selectedIds.length > 0 && (
                        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-[200] animate-in slide-in-from-bottom-10">
                            <div className="bg-zinc-900/80 backdrop-blur-2xl border border-amber-500/30 p-5 rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">{t("user.bebidas.refundAmount")}</p>
                                            <p className="text-2xl font-black text-white leading-none">{calculateTotalRefund()}€</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-tight mb-1">{selectedIds.length} {t("nav.bebidas")}</p>
                                        <button 
                                            onClick={() => setSelectedIds([])}
                                            className="text-[8px] text-zinc-500 hover:text-white font-black uppercase tracking-widest transition-colors"
                                        >
                                            {t("user.bebidas.backToList")}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSellBack}
                                    disabled={sellLoading}
                                    className="w-full py-3.5 bg-white hover:bg-amber-500 hover:text-zinc-950 text-zinc-950 font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] uppercase tracking-widest text-[10px]"
                                >
                                    {sellLoading ? <div className="w-4 h-4 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin"></div> : <Tag size={16} />}
                                    {t("user.bebidas.sellBtn")} {selectedIds.length} {t("nav.bebidas")}
                                </button>
                            </div>
                        </div>
                    )}

                    {giftModalOpen && selectedOrder && (
                        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95">
                                <button onClick={() => setGiftModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
                                <div className="mb-8">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
                                        <Gift size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{t("user.bebidas.giftTitle") || "REGALAR CONSUMICIÓN"}</h3>
                                    <p className="text-zinc-500 text-xs font-bold">{t("user.bebidas.giftSubtitle") || "Envía este producto a la cuenta de un amigo mediante su email."}</p>
                                </div>

                                {transferMsg.text && (
                                    <div className={`mb-6 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 ${transferMsg.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {transferMsg.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                                        {transferMsg.text}
                                    </div>
                                )}

                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{t("user.bebidas.friendEmail") || "EMAIL DEL AMIGO"}</label>
                                        <input 
                                            type="email" 
                                            value={friendEmail} 
                                            onChange={(e) => setFriendEmail(e.target.value)}
                                            placeholder="ejemplo@email.com"
                                            className="w-full bg-zinc-950 border border-zinc-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-emerald-500 text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleTransfer}
                                    disabled={transferLoading || !friendEmail}
                                    className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20"
                                >
                                    {transferLoading ? "..." : t("user.bebidas.sendGiftBtn") || "ENVIAR REGALO"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {transferMsg.text && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 duration-300 z-[2000] w-[90%] max-w-sm ${transferMsg.type === "success" ? "bg-emerald-500 text-zinc-950" : "bg-red-500 text-white"}`}>
                    {transferMsg.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{transferMsg.text}</span>
                </div>
            )}
        </div>
    );
}
