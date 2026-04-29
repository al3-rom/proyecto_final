import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPromocionesAdmin, createPromocion, updatePromocion, deletePromocion, fetchProducts } from "./thunks";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Calendar as CalendarIcon, Sparkles, X, Camera, Loader2, Percent, ShoppingBag, ChevronLeft, ChevronRight, Hash, Pencil } from "lucide-react";

export default function PromocionesAdmin() {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { promociones, promosStatus, products } = useSelector((state) => state.admin);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ titulo: "", descripcion: "", fecha_evento: "", descuento: 0, producto_id: "", limite_por_persona: 0 });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [promoToDelete, setPromoToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const BASE_URL = API_URL.replace("/api", "");

    useEffect(() => {
        if (user?.local_id) {
            dispatch(fetchPromocionesAdmin(user.local_id));
            if (products.length === 0) {
                dispatch(fetchProducts(user.local_id));
            }
        }
    }, [dispatch, user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ titulo: "", descripcion: "", fecha_evento: "", descuento: 0, producto_id: "", limite_por_persona: 0 });
        setFile(null);
        setPreview(null);
    };

    const handleEdit = (promo) => {
        setEditingId(promo.id);
        setFormData({
            titulo: promo.titulo,
            descripcion: promo.descripcion,
            fecha_evento: promo.fecha_evento ? promo.fecha_evento.split('T')[0] : "",
            descuento: promo.descuento || 0,
            producto_id: promo.producto_id || "",
            limite_por_persona: promo.limite_por_persona || 0
        });
        setPreview(promo.foto_url ? `${BASE_URL}${promo.foto_url}` : null);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append("titulo", formData.titulo);
        data.append("descripcion", formData.descripcion);
        data.append("fecha_evento", formData.fecha_evento);
        data.append("descuento", formData.descuento);
        data.append("local_id", user.local_id);
        data.append("limite_por_persona", formData.limite_por_persona);
        if (formData.producto_id) data.append("producto_id", formData.producto_id);
        if (file) data.append("foto", file);

        try {
            if (editingId) {
                await dispatch(updatePromocion({ id: editingId, formData: data })).unwrap();
            } else {
                await dispatch(createPromocion(data)).unwrap();
            }
            closeForm();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        const promo = promociones.find(p => p.id === id);
        setPromoToDelete(promo);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (promoToDelete) {
            dispatch(deletePromocion(promoToDelete.id));
            setDeleteModalOpen(false);
            setPromoToDelete(null);
        }
    };

    const getProductName = (id) => {
        const p = products.find(prod => prod.id === parseInt(id));
        if (!p) return "";
        const trans = p.Traduccion_productos?.find(tr => tr.codigo_idioma === i18n.language) || p.Traduccion_productos?.[0];
        return trans?.nombre || "";
    };

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendarDays = (date, onSelect) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = [];
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 border border-zinc-800/10 bg-zinc-950/20 opacity-30"></div>);
        }

        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
            const isSelected = formData.fecha_evento === dateStr;

            days.push(
                <div
                    key={d}
                    onClick={() => onSelect(dateStr)}
                    className={`h-10 border border-zinc-800/50 flex items-center justify-center transition-all relative cursor-pointer text-[10px] font-black ${isSelected ? 'bg-amber-500 text-zinc-950 border-amber-500' : isToday ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}
                >
                    {d}
                </div>
            );
        }
        return days;
    };

    const monthNames = t("admin.promociones.monthNames", { returnObjects: true });
    const dayNames = t("admin.promociones.dayNames", { returnObjects: true });

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">{t("admin.promociones.title")}</h2>
                    <div className="h-1.5 w-20 bg-amber-500 rounded-full"></div>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-zinc-950 rounded-2xl font-black hover:bg-amber-400 transition-all active:scale-95 shadow-[0_10px_30px_rgba(245,158,11,0.2)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.4)]"
                >
                    <Plus size={20} />
                    {t("admin.promociones.addBtn")}
                </button>
            </div>

            {promosStatus === "loading" && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={40} className="text-amber-500 animate-spin mb-4" />
                    <p className="text-zinc-500 font-bold">{t("user.lugares.loading")}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {promociones.map((promo) => (
                    <div key={promo.id} className="group bg-[#0a0a0a] border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-amber-500/50 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_60px_rgba(245,158,11,0.15)] relative flex flex-col hover:-translate-y-1">
                        <div className="aspect-video relative">
                            <img
                                src={promo.foto_url ? `${BASE_URL}${promo.foto_url}` : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"}
                                className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-110"
                                alt={promo.titulo}
                            />

                            {promo.descuento > 0 && (
                                <div className="absolute top-4 left-4 bg-amber-500 text-zinc-950 px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1 shadow-lg">
                                    <Percent size={14} />
                                    -{promo.descuento}%
                                </div>
                            )}

                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(promo);
                                    }}
                                    className="p-3 bg-amber-500 text-zinc-950 rounded-xl hover:bg-amber-400 shadow-lg"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(promo.id);
                                    }}
                                    className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        {promo.fecha_evento ? new Date(promo.fecha_evento).toLocaleDateString() : "Sin fecha"}
                                    </span>
                                </div>
                                {promo.producto_id && (
                                    <div className="flex items-center gap-1 text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg uppercase tracking-tight">
                                        <ShoppingBag size={10} />
                                        {getProductName(promo.producto_id)}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight truncate">{promo.titulo}</h3>
                            <p className="text-zinc-500 text-xs font-bold line-clamp-2 leading-relaxed mb-4">{promo.descripcion}</p>

                            {promo.limite_por_persona > 0 && (
                                <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                    <Hash size={12} className="text-amber-500" />
                                    {t("admin.promociones.limitLabel")}: {promo.limite_por_persona}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {promociones.length === 0 && promosStatus !== "loading" && (
                    <div className="col-span-full text-center py-20 border-2 border-dashed border-zinc-800 rounded-[3rem] bg-zinc-900/10">
                        <Sparkles size={48} className="mx-auto text-zinc-700 mb-4" />
                        <p className="text-zinc-500 font-bold">{t("admin.promociones.noPromos")}</p>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={closeForm}>
                    <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeForm();
                            }}
                            className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-8 text-center md:text-left">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                                {editingId ? t("admin.promociones.editPromo", "EDITAR PROMOCIÓN") : t("admin.promociones.newPromo")}
                            </h3>
                            <p className="text-zinc-500 text-xs font-bold">{t("admin.promociones.subtitle")}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative group">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="promo-photo"
                                    accept="image/*"
                                />
                                <label
                                    htmlFor="promo-photo"
                                    className="block aspect-video w-full bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-3xl overflow-hidden cursor-pointer hover:border-amber-500/50 transition-all relative"
                                >
                                    {preview ? (
                                        <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500">
                                            <Camera size={32} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t("admin.menu.photoPlaceholder")}</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t("admin.promociones.promoName")}</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-amber-500 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] text-sm font-bold transition-all"
                                    placeholder={t("admin.promociones.promoNamePlaceholder")}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative" ref={datePickerRef}>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t("admin.promociones.promoDate")}</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowDatePicker(!showDatePicker)}
                                        className="w-full bg-zinc-950 border border-zinc-800 text-white px-5 py-4 rounded-2xl flex items-center justify-between text-sm font-bold hover:border-amber-500/50 transition-all"
                                    >
                                        <span className={formData.fecha_evento ? "text-white" : "text-zinc-600"}>
                                            {formData.fecha_evento ? new Date(formData.fecha_evento).toLocaleDateString() : "Select Date..."}
                                        </span>
                                        <CalendarIcon size={18} className="text-amber-500" />
                                    </button>

                                    {showDatePicker && (
                                        <div className="absolute top-full left-0 mt-2 z-[1100] bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-3xl w-[280px] animate-in fade-in zoom-in-95">
                                            <div className="flex items-center justify-between mb-4">
                                                <button type="button" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-zinc-800 rounded-lg"><ChevronLeft size={16} /></button>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                                                <button type="button" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-zinc-800 rounded-lg"><ChevronRight size={16} /></button>
                                            </div>
                                            <div className="grid grid-cols-7 gap-px mb-2">
                                                {dayNames.map(d => <div key={d} className="text-center text-[7px] font-black text-zinc-600 uppercase">{d}</div>)}
                                            </div>
                                            <div className="grid grid-cols-7 gap-1">
                                                {renderCalendarDays(currentDate, (date) => {
                                                    setFormData({ ...formData, fecha_evento: date });
                                                    setShowDatePicker(false);
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t("admin.promociones.discountLabel")}</label>
                                    <div className="relative">
                                        <Percent size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" />
                                        <input
                                            type="number"
                                            value={formData.descuento}
                                            onChange={(e) => setFormData({ ...formData, descuento: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 text-white pl-12 pr-5 py-4 rounded-2xl focus:outline-none focus:border-amber-500 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] text-sm font-bold transition-all"
                                            placeholder={t("admin.promociones.discountPlaceholder")}
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t("admin.promociones.selectProduct")}</label>
                                    <select
                                        value={formData.producto_id}
                                        onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-amber-500 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] text-sm font-bold appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="">{t("admin.promociones.noProduct")}</option>
                                        {products.map(p => {
                                            const trans = p.Traduccion_productos?.find(tr => tr.codigo_idioma === i18n.language) || p.Traduccion_productos?.[0];
                                            return <option key={p.id} value={p.id}>{trans?.nombre} ({p.precio}€)</option>
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t("admin.promociones.limitLabel")}</label>
                                    <div className="relative">
                                        <Hash size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" />
                                        <input
                                            type="number"
                                            value={formData.limite_por_persona}
                                            onChange={(e) => setFormData({ ...formData, limite_por_persona: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 text-white pl-12 pr-5 py-4 rounded-2xl focus:outline-none focus:border-amber-500 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] text-sm font-bold transition-all"
                                            placeholder="Ex: 2"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t("admin.menu.descLabel")}</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-amber-500 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] text-sm font-bold resize-none transition-all"
                                    placeholder={t("admin.promociones.descPlaceholder")}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeForm();
                                    }}
                                    className="flex-1 py-4 bg-zinc-800 text-white font-black rounded-2xl hover:bg-zinc-700 transition-all uppercase text-[10px] tracking-widest"
                                >
                                    {t("admin.menu.cancelBtn")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-amber-500 text-zinc-950 font-black rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 uppercase text-[10px] tracking-widest"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : (editingId ? <Pencil size={18} /> : <Plus size={18} />)}
                                    {editingId ? t("admin.promociones.updateBtn", "ACTUALIZAR") : t("admin.promociones.saveBtn")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 blur-[60px] rounded-full pointer-events-none"></div>

                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <Trash2 className="text-red-500" size={32} />
                        </div>

                        <h3 className="text-2xl font-black text-white text-center mb-2">
                            {t("admin.menu.deleteConfirmTitle") || "¿Eliminar promoción?"}
                        </h3>

                        <p className="text-zinc-500 text-center text-xs font-bold leading-relaxed mb-8 px-4">
                            {t("admin.menu.deleteConfirmText") || "¿Estás seguro de que deseas eliminar esto?"}
                            <br /><span className="text-white mt-3 block text-sm">{promoToDelete?.titulo}</span>
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => { setDeleteModalOpen(false); setPromoToDelete(null); }}
                                className="flex-1 py-4 bg-zinc-800 text-white font-black rounded-2xl hover:bg-zinc-700 transition-all uppercase tracking-widest text-[10px]"
                            >
                                {t("admin.menu.cancelBtn")}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-400 transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20"
                            >
                                {t("admin.menu.deleteBtn") || "ELIMINAR"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
