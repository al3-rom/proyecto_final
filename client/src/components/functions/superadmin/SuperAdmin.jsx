import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Building2, Users, Settings, LogOut } from "lucide-react";
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
    const dispatch = useDispatch();
    const { loading, error, success } = useSelector(state => state.superadmin);
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

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 flex flex-col md:flex-row font-sans">
            <aside className="w-full md:w-72 bg-zinc-950/50 border-r border-zinc-800/50 p-6 flex flex-col gap-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <Settings className="text-zinc-950" size={24} />
                    </div>
                    <div>
                        <h1 className="text-white font-black tracking-tight leading-none text-xl">{t('superadmin.title').split(' ')[0]}</h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{t('superadmin.title').split(' ')[1]}</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab("locales")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'locales' ? 'bg-emerald-500/10 text-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
                    >
                        <Building2 size={20} />
                        {t('superadmin.localesTab')}
                    </button>
                    <button
                        onClick={() => setActiveTab("admins")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'admins' ? 'bg-emerald-500/10 text-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
                    >
                        <Users size={20} />
                        {t('superadmin.adminsTab')}
                    </button>
                    <button
                        onClick={() => navigate('/perfil')}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-all"
                    >
                        <Settings size={20} />
                        {t('nav.perfil')}
                    </button>
                </nav>

                <div className="mt-auto pt-6 border-t border-zinc-800/50">
                    <div className="flex items-center gap-3 px-2 mb-6">
                        <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                            <span className="text-xs font-bold text-white">{user?.nombre?.charAt(0)}</span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.nombre}</p>
                            <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            dispatch(logout());
                            navigate('/login');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                        <LogOut size={18} />
                        {t('perfil.logout')}
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-1 uppercase">
                            {activeTab === 'locales' ? t('superadmin.localesTitle') : t('superadmin.adminsTitle')}
                        </h2>
                        <p className="text-zinc-500 font-medium">{t('superadmin.subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-4 min-h-[40px]">
                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 px-4 py-2 rounded-lg text-sm font-bold animate-in fade-in zoom-in duration-300">
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm font-bold animate-in fade-in zoom-in duration-300">
                                {error}
                            </div>
                        )}
                    </div>
                </header>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'locales' ? <LocalesList /> : <AdminsList />}
                </div>
            </main>
        </div>
    );
}
