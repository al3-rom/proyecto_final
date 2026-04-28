import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, MapPin, Image as ImageIcon, Loader2, X } from "lucide-react";
import { createLocal, updateLocal } from "./thunks";
import { useTranslation } from "react-i18next";

export default function LocalesList() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { locales, loading } = useSelector(state => state.superadmin);
    const [showModal, setShowModal] = useState(false);
    const [editingLocal, setEditingLocal] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        ciudad: "",
        calle: "",
        foto: null
    });
    const API_URL = import.meta.env.VITE_API_URL;
    const BASE_URL = API_URL.replace("/api", "");
    const handleOpenModal = (local = null) => {
        if (local) {
            setEditingLocal(local);
            setFormData({
                nombre: local.nombre,
                ciudad: local.ciudad,
                calle: local.calle,
                foto: null
            });
        } else {
            setEditingLocal(null);
            setFormData({ nombre: "", ciudad: "", calle: "", foto: null });
        }
        setShowModal(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("nombre", formData.nombre);
        data.append("ciudad", formData.ciudad);
        data.append("calle", formData.calle);
        if (formData.foto) data.append("foto", formData.foto);
        if (editingLocal) {
            await dispatch(updateLocal({ id: editingLocal.id, formData: data }));
        } else {
            await dispatch(createLocal(data));
        }
        setShowModal(false);
    };
    return (
        <div>
            <div className="flex justify-end mb-8">
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-3 rounded-2xl font-black transition-all active:scale-95 shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
                >
                    <Plus size={20} />
                    {t('superadmin.newLocal')}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {locales.map(local => (
                    <div key={local.id} className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                        <div className="aspect-video relative overflow-hidden">
                            <img
                                src={local.foto_url ? `${BASE_URL}${local.foto_url}` : "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"}
                                alt={local.nombre}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                            <button
                                onClick={() => handleOpenModal(local)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500 hover:text-zinc-950"
                            >
                                <Edit size={18} />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{local.nombre}</h3>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
                                    <MapPin size={14} className="text-emerald-500" />
                                    {local.ciudad}, {local.calle}
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {local.usuarios?.slice(0, 3).map((admin, i) => (
                                            <div key={admin.id} className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[10px] font-bold text-emerald-500" title={admin.nombre}>
                                                {admin.nombre.charAt(0)}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                                        {t('superadmin.adminsCount', { count: local.usuarios?.length || 0 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
                    <form
                        onSubmit={handleSubmit}
                        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                                {editingLocal ? t('superadmin.editLocal') : t('superadmin.newLocal')}
                            </h2>
                            <button type="button" onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t('superadmin.localName')}</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none"
                                    placeholder="Ej: EcoNight Club"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t('superadmin.city')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.ciudad}
                                        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none"
                                        placeholder="Valencia"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t('superadmin.street')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.calle}
                                        onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none"
                                        placeholder="Av. de la Paz, 12"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t('superadmin.localPhoto')}</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={(e) => setFormData({ ...formData, foto: e.target.files[0] })}
                                        className="hidden"
                                        id="local-photo"
                                        accept="image/*"
                                    />
                                    <label
                                        htmlFor="local-photo"
                                        className="w-full bg-zinc-950 border border-zinc-800 border-dashed rounded-2xl px-5 py-8 text-zinc-500 font-bold hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {formData.foto ? (
                                            <span className="text-emerald-500 text-sm">{formData.foto.name}</span>
                                        ) : (
                                            <>
                                                <ImageIcon size={24} />
                                                <span className="text-sm">{t('superadmin.selectImage')}</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_15px_30px_rgba(16,185,129,0.3)] disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (editingLocal ? t('superadmin.saveChanges') : t('superadmin.createLocalBtn'))}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
