import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Building2, Users, Settings, LogOut, Menu, X } from "lucide-react";
import LocalesList from "./LocalesList";
import AdminsList from "./AdminsList";
import { fetchLocales, fetchAdmins } from "./thunks";
import { clearStatus } from "./superAdminSlice";
import { useTranslation } from "react-i18next";
import { logout } from "../../auth/authSlice";

export default function SuperAdmin() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("locales");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const { error, success } = useSelector(state => state.superadmin);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(fetchLocales());
        dispatch(fetchAdmins());
    }, [dispatch]);

    useEffect(() => {
        if (error === "Invalid token" || error === "Token required") {
            dispatch(logout());
            navigate("/login");
        }
    }, [error, dispatch, navigate]);

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => dispatch(clearStatus()), 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error, dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 flex flex-col md:flex-row font-sans">
            <div className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-[60]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Settings className="text-zinc-950" size={18} />
                    </div>
                    <span className="text-white font-black uppercase tracking-tight text-sm">SuperAdmin</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white bg-zinc-900 rounded-lg active:scale-95 transition-all">
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <aside className={`fixed inset-0 z-50 md:sticky md:top-0 md:h-screen md:flex md:w-72 bg-zinc-950/90 backdrop-blur-2xl md:bg-zinc-950 border-r border-zinc-900 p-8 flex-col gap-10 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                        <Settings className="text-zinc-950" size={24} />
                    </div>
                    <div>
                        <h1 className="text-white font-black tracking-tighter leading-none text-xl uppercase">EcoNight</h1>
                        <p className="text-[9px] text-emerald-500/70 font-black uppercase tracking-[0.2em] mt-1">{t('superadmin.panelLabel')}</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    <button
                        onClick={() => { setActiveTab("locales"); setIsSidebarOpen(false); }}
                        className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'locales' ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/10' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
                    >
                        <Building2 size={18} />
                        {t('superadmin.localesTab')}
                    </button>
                    <button
                        onClick={() => { setActiveTab("admins"); setIsSidebarOpen(false); }}
                        className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'admins' ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/10' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
                    >
                        <Users size={18} />
                        {t('superadmin.adminsTab')}
                    </button>
                    <button
                        onClick={() => { navigate('/perfil'); setIsSidebarOpen(false); }}
                        className="flex items-center gap-3 px-4 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-all"
                    >
                        <Settings size={18} />
                        {t('nav.perfil')}
                    </button>
                </nav>

                <div className="mt-auto pt-8 border-t border-zinc-900">
                    <div className="flex items-center gap-4 px-2 mb-8">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-500 shadow-inner">
                            <span className="font-black text-sm uppercase">{user?.nombre?.charAt(0)}</span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-white truncate uppercase tracking-tight">{user?.nombre}</p>
                            <p className="text-[10px] text-zinc-600 truncate font-bold">{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-zinc-600 hover:bg-red-500/10 hover:text-red-500 transition-all group">
                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                        {t('perfil.logout')}
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-14 overflow-y-auto min-h-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 mt-4">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2 uppercase leading-none">
                            {activeTab === 'locales' ? t('superadmin.localesTitle') : t('superadmin.adminsTitle')}
                        </h2>
                        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest opacity-80">{t('superadmin.subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-4 h-10">
                        {success && (
                            <div className="bg-emerald-500 text-zinc-950 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 animate-in fade-in zoom-in duration-300">
                                {t(success)}
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest animate-in fade-in zoom-in duration-300">
                                {error}
                            </div>
                        )}
                    </div>
                </header>

                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {activeTab === 'locales' ? <LocalesList /> : <AdminsList />}
                </div>
            </main>
        </div>
    );
}
