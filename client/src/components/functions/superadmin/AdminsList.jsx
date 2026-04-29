import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, User, Mail, Loader2, X, Building2, Key } from "lucide-react";
import { createAdmin, updateAdmin } from "./thunks";
import { useTranslation } from "react-i18next";

export default function AdminsList() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { admins, locales, loading } = useSelector(state => state.superadmin);
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({ nombre: "", email: "", password: "", local_id: "" });

    const handleOpenModal = (admin = null) => {
        if (admin) {
            setEditingAdmin(admin);
            setFormData({ nombre: admin.nombre, email: admin.email, password: "", local_id: admin.local_id || "" });
        } else {
            setEditingAdmin(null);
            setFormData({ nombre: "", email: "", password: "", local_id: "" });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingAdmin) await dispatch(updateAdmin({ id: editingAdmin.id, adminData: formData }));
        else await dispatch(createAdmin(formData));
        setShowModal(false);
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-center md:justify-end mb-10">
                <button onClick={() => handleOpenModal()} className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-500 text-zinc-950 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                    <Plus size={20} /> {t('superadmin.newAdmin')}
                </button>
            </div>

            <div className="hidden lg:block bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800/50">
                            <th className="px-10 py-8 text-[10px] font-black text-zinc-600 uppercase tracking-widest">{t('superadmin.tableAdmin')}</th>
                            <th className="px-10 py-8 text-[10px] font-black text-zinc-600 uppercase tracking-widest">{t('superadmin.tableContact')}</th>
                            <th className="px-10 py-8 text-[10px] font-black text-zinc-600 uppercase tracking-widest">{t('superadmin.tableLocal')}</th>
                            <th className="px-10 py-8 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">{t('superadmin.tableActions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => (
                            <tr key={admin.id} className="border-b border-zinc-800/20 hover:bg-zinc-800/30 transition-all group">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 font-black border border-emerald-500/20">{admin.nombre?.charAt(0)}</div>
                                        <span className="text-white font-black uppercase tracking-tight text-sm">{admin.nombre}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-zinc-300 font-bold text-xs">{admin.email}</span>
                                        <span className="text-[9px] text-emerald-500/60 font-black uppercase tracking-widest mt-0.5">{t('perfil.roleAdmin')}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={16} className="text-zinc-600" />
                                        <span className="text-zinc-400 font-bold text-xs uppercase tracking-tight">{admin.local?.nombre || t('superadmin.noLocalAssigned')}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <button onClick={() => handleOpenModal(admin)} className="w-10 h-10 bg-zinc-950 border border-zinc-800 hover:border-emerald-500 hover:bg-emerald-500 hover:text-zinc-950 rounded-xl inline-flex items-center justify-center text-zinc-500 transition-all active:scale-90"><Edit size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                {admins.map(admin => (
                    <div key={admin.id} className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all shadow-xl group">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 font-black border border-emerald-500/20 text-xl">{admin.nombre?.charAt(0)}</div>
                                <div>
                                    <h4 className="text-white font-black uppercase tracking-tight">{admin.nombre}</h4>
                                    <p className="text-[9px] text-emerald-500/60 font-black uppercase tracking-widest">{t('perfil.roleAdmin')}</p>
                                </div>
                            </div>
                            <button onClick={() => handleOpenModal(admin)} className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 active:scale-95 transition-all"><Edit size={20} /></button>
                        </div>
                        <div className="space-y-4 pt-6 border-t border-zinc-800/50">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Mail size={16} className="text-zinc-600" />
                                <span className="text-xs font-bold">{admin.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Building2 size={16} className="text-zinc-600" />
                                <span className="text-xs font-black uppercase tracking-tight">{admin.local?.nombre || t('superadmin.noLocalAssigned')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div onClick={() => setShowModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="relative w-full max-w-lg bg-[#0a0a0a] border border-zinc-800 rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">{editingAdmin ? t('superadmin.editAdmin') : t('superadmin.newAdmin')}</h2>
                            <button type="button" onClick={() => setShowModal(false)} className="text-zinc-600 hover:text-white transition-colors"><X size={28} /></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{t('superadmin.adminName')}</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                                    <input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-14 pr-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none text-sm" placeholder={t('superadmin.adminNamePlaceholder')} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{t('superadmin.adminEmail')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-14 pr-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none text-sm" placeholder={t('superadmin.emailPlaceholder')} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{editingAdmin ? t('superadmin.adminPassEdit') : t('superadmin.adminPass')}</label>
                                <div className="relative">
                                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                                    <input type="password" required={!editingAdmin} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-14 pr-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none text-sm" placeholder={t('superadmin.passPlaceholder')} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{t('superadmin.assignLocal')}</label>
                                <div className="relative">
                                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                                    <select required value={formData.local_id} onChange={(e) => setFormData({ ...formData, local_id: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-14 pr-5 py-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none appearance-none text-sm uppercase tracking-widest">
                                        <option value="">{t('superadmin.selectLocal')}</option>
                                        {locales.map(local => (
                                            <option key={local.id} value={local.id}>{local.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full mt-10 py-5 bg-emerald-500 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 uppercase text-[10px] tracking-widest disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" /> : (editingAdmin ? t('superadmin.updateAdminBtn') : t('superadmin.createAdminBtn'))}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
