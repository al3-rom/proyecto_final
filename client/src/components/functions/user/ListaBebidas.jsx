import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "./thunks";
import { useTranslation } from "react-i18next";
import { Beer, MapPin, QrCode, ChevronLeft, Info, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ListaBebidas() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { orders, ordersStatus } = useSelector((state) => state.user);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [view, setView] = useState("list");
    const [selectedLocalId, setSelectedLocalId] = useState(null);

    useEffect(() => {
        dispatch(fetchMyOrders());
    }, [dispatch]);

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

    if (ordersStatus === "loading") {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 font-medium animate-pulse">{t("user.bebidas.loading")}</p>
            </div>
        );
    }

    if (view === "qr" && selectedOrder) {
        return (
            <div
                className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pt-24 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setView("list")}
            >
                <div
                    className="max-w-sm w-full animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setView("list")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-xs">{t("user.bebidas.backToList")}</span>
                    </button>

                    <div className="bg-zinc-900 mb-15 border border-zinc-800 rounded-[3rem] p-8 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full"></div>

                        <h2 className="text-3xl font-black text-white mb-2">{t("user.bebidas.qrTitle")}</h2>
                        <p className="text-zinc-500 text-sm mb-10 px-4">{t("user.bebidas.qrSubtitle")}</p>

                        <div className="bg-white p-6 rounded-[2rem] inline-block mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedOrder.qr_code}`}
                                alt="QR Code"
                                className="w-48 h-48 sm:w-64 sm:h-64"
                            />
                        </div>

                        <div className="bg-zinc-950/50 rounded-2xl p-6 border border-zinc-800/50">
                            <p className="text-emerald-400 font-black text-xl mb-1">{getProductName(selectedOrder)}</p>
                            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                                <MapPin size={12} /> {selectedOrder.local?.nombre}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === "detail" && selectedOrder) {
        return (
            <div
                className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pt-24 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setView("list")}
            >
                <div
                    className="max-w-sm w-full animate-in slide-in-from-bottom-10 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setView("list")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-xs">{t("user.bebidas.backToList")}</span>
                    </button>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="aspect-[4/3] relative">
                            <img
                                src={selectedOrder.producto?.foto_url ? `${BASE_URL}${selectedOrder.producto.foto_url}` : "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"}
                                alt={getProductName(selectedOrder)}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-2xl font-black text-white">{getProductName(selectedOrder)}</h2>
                                <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    {selectedOrder.estado === "Entregado" ? t("user.bebidas.statusEntregado") : t("user.bebidas.statusPendiente")}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-zinc-400 mb-6">
                                <MapPin size={14} className="text-emerald-500" />
                                <span className="text-sm font-bold">{selectedOrder.local?.nombre}</span>
                            </div>

                            <div className="space-y-6 mb-8">
                                <div>
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">{t("user.bebidas.descriptionLabel")}</p>
                                    <p className="text-zinc-400 leading-relaxed text-xs">{getProductDesc(selectedOrder)}</p>
                                </div>
                            </div>

                            {selectedOrder.estado !== "Entregado" && (
                                <button
                                    onClick={() => setView("qr")}
                                    className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(16,185,129,0.3)]"
                                >
                                    <QrCode size={24} />
                                    {t("user.bebidas.useBtn")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const groupedOrders = orders.reduce((acc, order) => {
        const localId = order.local_id;
        if (!acc[localId]) {
            acc[localId] = {
                id: localId,
                nombre: order.local?.nombre || "Local",
                foto_url: order.local?.foto_url || "",
                ciudad: order.local?.ciudad || "",
                calle: order.local?.calle || "",
                pedidos: []
            };
        }
        acc[localId].pedidos.push(order);
        return acc;
    }, {});

    const groups = Object.values(groupedOrders);

    return (
        <div className="max-w-6xl mx-auto px-4 pb-20">
            <div className="mb-12">
                <h1 className="text-5xl font-black text-white mb-3 tracking-tighter">{t("user.bebidas.title")}</h1>
                <p className="text-zinc-500 font-medium text-lg">{t("user.bebidas.subtitle")}</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-32 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[3rem]">
                    <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                        <Beer size={40} className="text-zinc-700" />
                    </div>
                    <p className="text-zinc-400 text-xl font-bold mb-8">{t("user.bebidas.noOrders")}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all"
                    >
                        {t("user.bebidas.buyMore")}
                    </button>
                </div>
            ) : selectedLocalId === null ? (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groups.map((group, idx) => (
                        <div
                            key={group.id}
                            onClick={() => setSelectedLocalId(group.id)}
                            className="group relative bg-zinc-900/30 border border-zinc-800/50 rounded-[3rem] overflow-hidden hover:border-emerald-500/40 transition-all duration-700 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="aspect-[4/5] relative overflow-hidden">
                                <img
                                    src={group.foto_url ? `${BASE_URL}${group.foto_url}` : "https://images.unsplash.com/photo-1566733971257-81c20d828c2e?q=80&w=1974&auto=format&fit=crop"}
                                    alt={group.nombre}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>

                                <div className="absolute bottom-0 left-0 w-full p-8">
                                    <h3 className="text-3xl font-black text-white mb-2">{group.nombre}</h3>
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold mb-4">
                                        <MapPin size={14} />
                                        <span className="text-xs uppercase tracking-widest">{group.ciudad}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white text-xs font-bold border border-white/10">
                                            {group.pedidos.length} {group.pedidos.length === 1 ? t("nav.bebidas").toLowerCase() : t("nav.bebidas").toLowerCase()}
                                        </span>
                                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-zinc-950">
                                            <ChevronLeft className="rotate-180" size={20} />
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
                        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-10 transition-colors group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-xs">{t("user.lugares.backToList")}</span>
                    </button>

                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-3">
                            <MapPin className="text-emerald-500" size={28} />
                            {groupedOrders[selectedLocalId].nombre}
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/50 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {groupedOrders[selectedLocalId].pedidos.map((order) => (
                            <div
                                key={order.id}
                                className="group relative bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden hover:border-emerald-500/40 transition-all duration-500 shadow-xl"
                            >
                                <div className="aspect-[16/10] relative overflow-hidden">
                                    <img
                                        src={order.producto?.foto_url ? `${BASE_URL}${order.producto.foto_url}` : "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"}
                                        alt={getProductName(order)}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>

                                    <div className="absolute top-4 right-4">
                                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.estado === 'Entregado' ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}>
                                            {order.estado === 'Entregado' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                            {order.estado === 'Entregado' ? t("user.bebidas.statusEntregado") : t("user.bebidas.statusPendiente")}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-6 truncate">{getProductName(order)}</h3>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => { setSelectedOrder(order); setView("detail"); }}
                                            className="py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <Info size={16} />
                                            {t("user.bebidas.detailBtn")}
                                        </button>
                                        {order.estado !== "Entregado" && (
                                            <button
                                                onClick={() => { setSelectedOrder(order); setView("qr"); }}
                                                className="py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                <QrCode size={16} />
                                                {t("user.bebidas.useBtn")}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}



