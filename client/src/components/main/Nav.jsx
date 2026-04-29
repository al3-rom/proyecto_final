import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Wine, User, QrCode, Users, ClipboardList, Leaf, Sparkles } from "lucide-react";
import Logotipo from '../../assets/Logo.png';
import { useTranslation } from "react-i18next";

export default function Nav() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state) => state.auth.user);
    const role = user?.rol?.toLowerCase();
    const { t } = useTranslation();

    const navItems = {
        user: [
            { id: 'lugares', path: '/', icon: MapPin, label: t('nav.lugares') },
            { id: 'bebidas', path: '/bebidas', icon: Wine, label: t('nav.bebidas') },
            { id: 'perfil', path: '/perfil', icon: User, label: t('nav.perfil') },
        ],
        staff: [
            { id: 'scaner', path: '/scan', icon: QrCode, label: t('nav.scanner') },
            { id: 'perfil', path: '/perfil', icon: User, label: t('nav.perfil') },
        ],
        admin: [
            { id: 'empleados', path: '/admin/empleados', icon: Users, label: t('nav.empleados') },
            { id: 'menu', path: '/admin/menu', icon: ClipboardList, label: t('nav.menu') },
            { id: 'promociones', path: '/admin/promociones', icon: Sparkles, label: t('nav.promociones') || 'Promos' },
            { id: 'eco', path: '/admin/eco', icon: Leaf, label: t('nav.eco') },
            { id: 'perfil', path: '/perfil', icon: User, label: t('nav.perfil') },
        ],
        superadmin: [
            { id: 'superadmin', path: '/superadmin', icon: Users, label: t('nav.superadmin') || 'SuperAdmin' },
            { id: 'perfil', path: '/perfil', icon: User, label: t('nav.perfil') },
        ]
    };

    const currentItems = navItems[role] || [];

    const getIsActive = (path) => {
        if (location.pathname === path) return true;
        if (location.pathname === '/' && path === '/admin/empleados' && role === 'admin') return true;
        return false;
    };

    return (
        <>
            <nav className="hidden md:flex fixed top-0 left-0 w-full bg-[#050505]/90 backdrop-blur-2xl border-b border-zinc-800/50 z-[100] px-8 py-3 items-center shadow-2xl">
                <div className="flex-1 flex items-center">
                    <div className="flex items-center gap-3 cursor-pointer group relative" onClick={() => navigate('/')}>
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <img src={Logotipo} alt="Logo" className="w-9 h-9 object-contain group-hover:scale-110 transition-all relative z-10" />
                        <span className="font-black text-xl text-white tracking-tighter group-hover:text-emerald-400 transition-colors relative z-10 uppercase">EcoNight</span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-800/50">
                    {currentItems.map(item => {
                        const Icon = item.icon;
                        const isActive = getIsActive(item.path);
                        return (
                            <button
                                key={item.id}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(item.path);
                                }}
                                className={`flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all px-5 py-2.5 rounded-xl cursor-pointer pointer-events-auto ${isActive ? 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] border border-emerald-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
                            >
                                <Icon size={16} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1 flex justify-end">
                </div>
            </nav>

            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-[#0a0a0a]/95 backdrop-blur-2xl border border-zinc-800/50 rounded-[2.5rem] flex justify-around items-center py-3 px-2 z-[100] shadow-2xl">
                {currentItems.map(item => {
                    const Icon = item.icon;
                    const isActive = getIsActive(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(item.path);
                            }}
                            className={`relative z-10 flex flex-col items-center justify-center w-16 p-2 rounded-2xl transition-all cursor-pointer pointer-events-auto ${isActive ? 'text-emerald-400 bg-emerald-500/10 scale-105' : 'text-zinc-600 hover:text-zinc-300'}`}
                        >
                            <Icon size={22} className={`mb-1 transition-transform ${isActive ? '-translate-y-0.5' : ''}`} />
                            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
            
            <div className="md:h-20" />
        </>
    );
}
