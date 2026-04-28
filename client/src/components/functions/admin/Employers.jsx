import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, X, Save, User, Mail, Shield, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
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
        dispatch(fetchStaff());
    }, [dispatch]);

    const handleOpenModal = (item = null) => {
        if (!item && !adminLocalId) {
            alert(t("admin.staff.errorNoLocalId"));
            return;
        }
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

    const handleOpenDeleteModal = (item) => {
        setStaffToDelete(item);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setStaffToDelete(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: "", text: "" });

        try {
            if (editingStaff) {
                await dispatch(updateStaff({ id: editingStaff.id, staffData: formData })).unwrap();
                setMsg({ type: "success", text: t("admin.staff.updateSuccess") });
                setTimeout(() => handleCloseModal(), 1500);
            } else {
                await dispatch(createStaff(formData)).unwrap();
                setMsg({ type: "success", text: t("admin.staff.createSuccess") });
                setTimeout(() => handleCloseModal(), 1500);
            }
        } catch (error) {
            const errorMsg = (error === "Email already registered" || error?.error === "Email already registered")
                ? t("auth.errors.emailExists")
                : (typeof error === 'string' ? error : t("auth.errors.unexpected"));

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
            setMsg({ type: "success", text: t("admin.staff.deleteSuccess") });
            handleCloseDeleteModal();
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
            setMsg({ type: "success", text: t("admin.staff.deleteAllSuccess") });
            setTimeout(() => setMsg({ type: "", text: "" }), 3000);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Shield className="text-emerald-500" />
                        {t("admin.staff.title")}
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">
                        {t("admin.staff.count", { count: staff.length })}
                    </p>
                </div>
                <div className="flex gap-3">
                    {staff.length > 0 && (
                        <button
                            onClick={() => setShowDeleteAllModal(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl transition-all border border-red-500/20"
                        >
                            <Trash2 size={18} />
                            {t("admin.staff.deleteAll")}
                        </button>
                    )}
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                        <Plus size={20} />
                        {t("admin.staff.addBtn")}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {status === "loading" && staff.length === 0 ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500 border-solid"></div>
                    </div>
                ) : (
                    staff.map((item) => (
                        <div key={item.id} className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 flex gap-2">
                                <button onClick={() => handleOpenModal(item)} className="p-2 bg-zinc-900 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleOpenDeleteModal(item)} className="p-2 bg-zinc-900 rounded-xl text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-3 mb-5">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0">
                                    {item.foto_perfil_url ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${item.foto_perfil_url}`}
                                            alt={item.nombre}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                        />
                                    ) : null}
                                    <User size={36} className={item.foto_perfil_url ? "hidden" : ""} />
                                </div>
                                <div className="text-center min-w-0">
                                    <h3 className="font-bold text-white truncate">{item.nombre}</h3>
                                    <p className="text-xs text-emerald-500/70 font-bold uppercase tracking-widest">{t("perfil.roleStaff")}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <Mail size={14} className="shrink-0" />
                                    <span className="truncate">{item.email}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {modalOpen && (
                <div
                    onClick={handleCloseModal}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#0f0f0f] border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300"
                    >
                        <button onClick={handleCloseModal} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                                {editingStaff ? t("admin.staff.editBtn") : t("admin.staff.addBtn")}
                            </h2>
                            <p className="text-zinc-500 text-sm">{editingStaff ? t("admin.staff.subtitleEdit") : t("admin.staff.subtitleAdd")}</p>
                        </div>

                        {msg.text && (
                            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${msg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                {msg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                {msg.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 ml-1">{t("admin.staff.name")}</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                                    placeholder={t("admin.staff.namePlaceholder")}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 ml-1">{t("admin.staff.email")}</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                                    placeholder={t("admin.staff.emailPlaceholder")}
                                />
                            </div>

                            {!editingStaff && (
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 ml-1">{t("admin.staff.password")}</label>
                                    <input
                                        required={!editingStaff}
                                        type="password"
                                        minLength={6}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}


                            <div className="pt-4">
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all transform active:scale-[0.98] shadow-[0_10px_30px_rgba(16,185,129,0.2)] disabled:opacity-50"
                                >
                                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-zinc-950 border-solid"></div> : <><Save size={20} /> {t("admin.staff.saveBtn")}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {}
            {showDeleteModal && (
                <div
                    onClick={handleCloseDeleteModal}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#0f0f0f] border border-zinc-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                                <Trash2 size={32} />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2">{t("admin.staff.deleteTitle")}</h2>
                            <p className="text-zinc-500 text-sm mb-8">
                                {t("admin.staff.confirmDelete")}
                                <span className="block mt-2 text-zinc-600 italic">
                                    {t("admin.staff.deleteWarning")}
                                </span>
                            </p>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button
                                    onClick={handleCloseDeleteModal}
                                    className="py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all active:scale-95"
                                >
                                    {t("admin.staff.cancelBtn")}
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={handleDelete}
                                    className="py-3.5 bg-red-500 hover:bg-red-400 text-white font-black rounded-2xl transition-all active:scale-95 shadow-[0_10px_20px_rgba(239,68,68,0.2)] disabled:opacity-50 flex items-center justify-center"
                                >
                                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid"></div> : t("admin.staff.deleteBtn")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteAllModal && (
                <div onClick={() => setShowDeleteAllModal(false)} className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0f0f0f] border border-zinc-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                                <AlertCircle size={32} />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2">{t("admin.staff.deleteAll")}</h2>
                            <p className="text-zinc-500 text-sm mb-8">{t("admin.staff.deleteAllConfirm")}</p>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button onClick={() => setShowDeleteAllModal(false)} className="py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all active:scale-95">
                                    {t("admin.staff.cancelBtn")}
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={handleDeleteAll}
                                    className="py-3.5 bg-red-500 hover:bg-red-400 text-white font-black rounded-2xl transition-all active:scale-95 shadow-[0_10px_20px_rgba(239,68,68,0.2)] disabled:opacity-50 flex items-center justify-center"
                                >
                                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid"></div> : t("admin.staff.deleteBtn")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



