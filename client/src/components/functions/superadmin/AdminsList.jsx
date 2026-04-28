import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, User, Mail, Shield, Loader2, X, Building2, Key } from "lucide-react";
import { createAdmin, updateAdmin } from "./thunks";
import { useTranslation } from "react-i18next";

export default function AdminsList() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { admins, locales, loading } = useSelector(state => state.superadmin);
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        password: "",
        local_id: ""
    });
    const handleOpenModal = (admin = null) => {
        if (admin) {
            setEditingAdmin(admin);
            setFormData({
                nombre: admin.nombre,
                email: admin.email,
                password: "",
                local_id: admin.local_id || ""
            });
        } else {
            setEditingAdmin(null);
            setFormData({ nombre: "", email: "", password: "", local_id: "" });
        }
        setShowModal(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingAdmin) {
            await dispatch(updateAdmin({ id: editingAdmin.id, adminData: formData }));
        } else {
            await dispatch(createAdmin(formData));
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
                    {t('superadmin.newAdmin')}
                </button>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800/50">
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('superadmin.tableAdmin')}</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('superadmin.tableContact')}</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('superadmin.tableLocal')}</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">{t('superadmin.tableActions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => (
                                <tr key={admin.id} className="border-b border-zinc-800/20 hover:bg-zinc-800/20 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 font-black">
                                                {admin.nombre.charAt(0)}
                                            </div>
                                            <span className="text-white font-bold">{admin.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-300 font-medium">{admin.email}</span>
                                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Rol: Admin</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} className="text-emerald-500" />
                                            <span className="text-zinc-400 font-bold">{admin.local?.nombre || "Sin local"}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => handleOpenModal(admin)}
                                            className="w-10 h-10 bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 rounded-xl inline-flex items-center justify-center text-zinc-500 transition-all active:scale-90"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                                {editingAdmin ? t('superadmin.editAdmin') : t('superadmin.newAdmin')}
                            </h2>
                            <button type="button" onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t('superadmin.adminName')}</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none"
                                        placeholder="Nombre del admin"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t('superadmin.adminEmail')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none"
                                        placeholder="email@ejemplo.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">
                                    {editingAdmin ? t('superadmin.adminPassEdit') : t('superadmin.adminPass')}
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                    <input
                                        type="password"
                                        required={!editingAdmin}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{t('superadmin.assignLocal')}</label>
                                <div className="relative">
                                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                    <select
                                        required
                                        value={formData.local_id}
                                        onChange={(e) => setFormData({ ...formData, local_id: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none appearance-none"
                                    >
                                        <option value="">{t('superadmin.selectLocal')}</option>
                                        {locales.map(local => (
                                            <option key={local.id} value={local.id}>{local.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_15px_30px_rgba(16,185,129,0.3)] disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (editingAdmin ? t('superadmin.updateAdminBtn') : t('superadmin.createAdminBtn'))}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
