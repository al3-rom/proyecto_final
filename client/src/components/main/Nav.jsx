import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Wine, User, QrCode, Users, ClipboardList } from "lucide-react";
import Logotipo from '../../assets/Logo.png';
import { useTranslation } from "react-i18next";

export default function Nav() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state) => state.auth.user);
    const role = user.rol;
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
            { id: 'perfil', path: '/perfil', icon: User, label: t('nav.perfil') },
        ]
    };

    const currentItems = navItems[role];

    return (
        <>
            <nav className="hidden md:flex fixed top-0 left-0 w-full bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-800/60 z-50 px-10 py-3 items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.8)] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] before:from-emerald-900/10 before:to-transparent before:pointer-events-none">
                <div className="flex items-center gap-3 cursor-pointer group relative z-10" onClick={() => navigate('/')}>
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img src={Logotipo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] group-hover:scale-110 transition-all duration-300 relative z-10" />
                    <span className="font-extrabold text-2xl text-white tracking-tight group-hover:text-emerald-400 transition-colors duration-300 relative z-10">EcoNight</span>
                </div>
                <div className="flex gap-3 relative z-10">
                    {currentItems.map(item => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center gap-2 font-semibold transition-all duration-300 px-5 py-2.5 rounded-2xl ${isActive ? 'text-emerald-400 bg-emerald-500/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.15)] border border-emerald-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'}`}
                            >
                                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : ''} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#0a0a0a]/90 backdrop-blur-xl border border-zinc-700/60 rounded-[2rem] flex justify-around items-center py-2 px-2 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/0 via-emerald-900/10 to-emerald-900/0 opacity-50"></div>
                {currentItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`relative z-10 flex flex-col items-center justify-center w-16 p-2 rounded-2xl transition-all duration-300 ${isActive ? 'text-emerald-400 bg-emerald-500/10 scale-105 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Icon size={24} className={`mb-1 transition-transform ${isActive ? 'drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] -translate-y-1' : ''}`} />
                            <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="md:h-20" />
        </>
    );
}