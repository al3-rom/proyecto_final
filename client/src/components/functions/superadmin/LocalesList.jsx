import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, MapPin, Image as ImageIcon, Loader2, X, Trash2 } from "lucide-react";
import { createLocal, updateLocal, deleteLocal } from "./thunks";
import { useTranslation } from "react-i18next";

export default function LocalesList() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { locales, loading } = useSelector(state => state.superadmin);
    const [showModal, setShowModal] = useState(false);
    const [editingLocal, setEditingLocal] = useState(null);
    const [formData, setFormData] = useState({ nombre: "", ciudad: "", calle: "", tipo: "normal", foto: null });
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    
    const API_URL = import.meta.env.VITE_API_URL;
    const BASE_URL = API_URL.replace("/api", "");

    const handleOpenModal = (local = null) => {
        if (local) {
            setEditingLocal(local);
            setFormData({ nombre: local.nombre, ciudad: local.ciudad, calle: local.calle || local.direccion, tipo: local.tipo || "normal", foto: null });
        } else {
            setEditingLocal(null);
            setFormData({ nombre: "", ciudad: "", calle: "", tipo: "normal", foto: null });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("nombre", formData.nombre);
        data.append("ciudad", formData.ciudad);
        data.append("calle", formData.calle);
        data.append("tipo", formData.tipo);
        if (formData.foto) data.append("foto", formData.foto);

        if (editingLocal) await dispatch(updateLocal({ id: editingLocal.id, formData: data }));
        else await dispatch(createLocal(data));
        setShowModal(false);
    };

    const handleDelete = async (id) => {
        await dispatch(deleteLocal(id));
        setDeleteConfirmId(null);
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-center md:justify-end mb-10">
                <button onClick={() => handleOpenModal()} className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-500 text-zinc-950 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                    <Plus size={20} /> {t('superadmin.newLocal')}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {locales.map(local => (
                    <div key={local.id} className="group bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-500 shadow-xl">
                        <div className="aspect-[16/10] relative overflow-hidden bg-zinc-950">
                            <img src={local.foto ? `${BASE_URL}${local.foto}` : ""} alt={local.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-[8px] font-black text-white uppercase tracking-widest">
                                {local.tipo === 'festival' ? t('superadmin.typeFestival') : t('superadmin.typeNormal')}
                            </div>
                            <div className="absolute top-4 right-4 flex gap-2 md:opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => handleOpenModal(local)} className="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-emerald-500 hover:text-zinc-950 transition-all"><Edit size={18} /></button>
                                <button onClick={() => setDeleteConfirmId(local.id)} className="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight truncate">{local.nombre}</h3>
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-tight">
                                <MapPin size={14} className="text-emerald-500" />
                                <span className="truncate">{local.ciudad}, {local.calle || local.direccion}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div onClick={() => setShowModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="relative w-full max-w-lg bg-[#0a0a0a] border border-zinc-800 rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">{editingLocal ? t('superadmin.editLocal') : t('superadmin.newLocal')}</h2>
                            <button type="button" onClick={() => setShowModal(false)} className="text-zinc-600 hover:text-white transition-colors"><X size={28} /></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{t('superadmin.localName')}</label>
                                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none text-sm" placeholder={t('superadmin.localNamePlaceholder')} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{t('superadmin.city')}</label>
                                    <input type="text" required value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none text-sm" placeholder={t('superadmin.cityPlaceholder')} />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{t('superadmin.street')}</label>
                                    <input type="text" required value={formData.calle} onChange={(e) => setFormData({ ...formData, calle: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none text-sm" placeholder={t('superadmin.streetPlaceholder')} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{t('superadmin.localTypeLabel')}</label>
                                <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none appearance-none text-sm uppercase tracking-widest">
                                    <option value="normal">{t('superadmin.typeNormal')}</option>
                                    <option value="festival">{t('superadmin.typeFestival')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{t('superadmin.localPhoto')}</label>
                                <label htmlFor="local-photo" className="w-full bg-zinc-950 border border-zinc-800 border-dashed rounded-xl p-8 text-zinc-600 font-bold hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group">
                                    <input type="file" onChange={(e) => setFormData({ ...formData, foto: e.target.files[0] })} className="hidden" id="local-photo" accept="image/*" />
                                    {formData.foto ? (
                                        <span className="text-emerald-500 text-xs font-black uppercase tracking-tight">{formData.foto.name}</span>
                                    ) : (
                                        <>
                                            <ImageIcon size={32} className="group-hover:text-emerald-500 transition-colors" />
                                            <span className="text-[10px] uppercase tracking-widest">{t('superadmin.selectImage')}</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full mt-10 py-5 bg-emerald-500 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 uppercase text-[10px] tracking-widest disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" /> : (editingLocal ? t('superadmin.saveChanges') : t('superadmin.createLocalBtn'))}
                        </button>
                    </form>
                </div>
            )}

            {deleteConfirmId && (
                <div onClick={() => setDeleteConfirmId(null)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-red-950/30 w-full max-w-sm rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_100px_rgba(239,68,68,0.1)] relative animate-in zoom-in-95 text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <Trash2 size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{t('superadmin.deleteConfirmTitle') || "¿ELIMINAR LOCAL?"}</h2>
                        <p className="text-zinc-500 text-sm font-bold leading-relaxed mb-8">
                            {t('superadmin.deleteConfirmText') || "Esta acción borrará permanentemente al administrador y trabajadores asociados. Las bebidas se mantendrán disponibles."}
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all active:scale-95 uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20"
                            >
                                {t('superadmin.confirmDeleteBtn') || "SÍ, ELIMINAR TODO"}
                            </button>
                            <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="w-full py-4 bg-zinc-900 text-zinc-400 font-black rounded-2xl hover:bg-zinc-800 transition-all uppercase text-[10px] tracking-widest"
                            >
                                {t('superadmin.cancelBtn') || "CANCELAR"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
