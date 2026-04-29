import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, X, Save, User, Mail, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { fetchStaff, createStaff, updateStaff, deleteStaff, deleteAllStaff } from "./thunks";

export default function Employers() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { staff, status } = useSelector((state) => state.admin);
    const user = useSelector((state) => state.auth.user);
    const adminLocalId = user?.local_id;

    const [modalOpen, setModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({ nombre: "", email: "", password: "", local_id: "" });
    const [msg, setMsg] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);

    useEffect(() => {
        if (adminLocalId) dispatch(fetchStaff(adminLocalId));
    }, [dispatch, adminLocalId]);

    const handleOpenModal = (item = null) => {
        if (!item && !adminLocalId) return;
        if (item) {
            setEditingStaff(item);
            setFormData({ nombre: item.nombre, email: item.email, password: "", local_id: item.local_id || "" });
        } else {
            setEditingStaff(null);
            setFormData({ nombre: "", email: "", password: "", local_id: adminLocalId || "" });
        }
        setModalOpen(true);
        setMsg({ type: "", text: "" });
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingStaff(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: "", text: "" });
        try {
            if (editingStaff) await dispatch(updateStaff({ id: editingStaff.id, staffData: formData })).unwrap();
            else await dispatch(createStaff(formData)).unwrap();
            setMsg({ type: "success", text: t("admin.staff.createSuccess") });
            setTimeout(() => handleCloseModal(), 1500);
        } catch (error) {
            const errorMsg = (error === "Email already registered" || error?.error === "Email already registered") ? t("auth.errors.emailExists") : t("auth.errors.unexpected");
            setMsg({ type: "error", text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!staffToDelete) return;
        setLoading(true);
        try {
            await dispatch(deleteStaff(staffToDelete.id)).unwrap();
            setShowDeleteModal(false);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        setLoading(true);
        try {
            await dispatch(deleteAllStaff(adminLocalId)).unwrap();
            setShowDeleteAllModal(false);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase flex flex-col md:flex-row items-center gap-3">
                        <Shield className="text-emerald-500" size={48} />
                        {t("admin.staff.title")}
                    </h1>
                    <p className="text-zinc-500 font-bold mt-2 uppercase tracking-widest text-xs">{t("admin.staff.count", { count: staff.length })}</p>
                </div>
                <div className="flex justify-center gap-3">
                    {staff.length > 0 && (
                        <button onClick={() => setShowDeleteAllModal(true)} className="px-5 py-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all"><Trash2 size={20} /></button>
                    )}
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-zinc-950 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                        <Plus size={20} /> {t("admin.staff.addBtn")}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {status === "loading" && staff.length === 0 ? (
                    <div className="col-span-full py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div></div>
                ) : staff.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-zinc-600 font-black uppercase text-xl">{t("admin.staff.noStaff") || "No staff found"}</div>
                ) : (
                    staff.map((item) => (
                        <div key={item.id} className="group bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-6 hover:border-emerald-500/30 transition-all shadow-xl relative overflow-hidden">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => handleOpenModal(item)} className="p-3 bg-black/60 backdrop-blur-md rounded-xl text-zinc-400 hover:text-white transition-all"><Edit2 size={16} /></button>
                                <button onClick={() => { setStaffToDelete(item); setShowDeleteModal(true); }} className="p-3 bg-black/60 backdrop-blur-md rounded-xl text-red-500/70 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                            </div>
                            <div className="flex flex-col items-center gap-4 mb-6">
                                <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                    {item.foto_perfil_url ? (
                                        <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${item.foto_perfil_url}`} alt={item.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : <User size={40} />}
                                </div>
                                <div className="text-center">
                                    <h3 className="font-black text-white text-lg uppercase tracking-tight truncate max-w-[200px]">{item.nombre}</h3>
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">{t("perfil.roleStaff")}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs font-bold border-t border-zinc-800/50 pt-4">
                                <Mail size={14} className="text-zinc-600" />
                                <span className="truncate">{item.email}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {modalOpen && (
                <div onClick={handleCloseModal} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={handleCloseModal} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"><X size={24} /></button>
                        <div className="mb-8">
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{editingStaff ? t("admin.staff.editBtn") : t("admin.staff.addBtn")}</h2>
                            <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mt-1">{editingStaff ? t("admin.staff.subtitleEdit") : t("admin.staff.subtitleAdd")}</p>
                        </div>
                        {msg.text && (
                            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-tight ${msg.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {msg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                {msg.text}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{t("admin.staff.name")}</label>
                                <input required type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 text-white px-5 py-4 rounded-xl focus:border-emerald-500/50 outline-none font-bold text-sm" placeholder={t("admin.staff.namePlaceholder")} />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{t("admin.staff.email")}</label>
                                <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 text-white px-5 py-4 rounded-xl focus:border-emerald-500/50 outline-none font-bold text-sm" placeholder="email@example.com" />
                            </div>
                            {!editingStaff && (
                                <div>
                                    <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{t("admin.staff.password")}</label>
                                    <input required type="password" minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 text-white px-5 py-4 rounded-xl focus:border-emerald-500/50 outline-none font-bold text-sm" placeholder="••••••••" />
                                </div>
                            )}
                            <button disabled={loading} type="submit" className="w-full py-5 bg-emerald-500 text-zinc-950 font-black rounded-2xl text-[10px] uppercase tracking-widest mt-4 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50">
                                {loading ? "..." : t("admin.staff.saveBtn")}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {(showDeleteModal || showDeleteAllModal) && (
                <div onClick={() => { setShowDeleteModal(false); setShowDeleteAllModal(false); }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95 text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-6 mx-auto"><Trash2 size={40} /></div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{t("admin.staff.deleteTitle")}</h2>
                        <p className="text-zinc-500 font-bold text-xs mb-8 leading-relaxed">{showDeleteAllModal ? t("admin.staff.deleteAllConfirm") : t("admin.staff.confirmDelete")}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => { setShowDeleteModal(false); setShowDeleteAllModal(false); }} className="py-4 bg-zinc-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest">No</button>
                            <button disabled={loading} onClick={showDeleteAllModal ? handleDeleteAll : handleDelete} className="py-4 bg-red-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all">Si</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
