import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { User, Mail, Wallet, Shield, Settings, LogOut, Key, Trash2, X, CheckCircle2, AlertCircle, Globe, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchUserProfile, updateProfilePhoto, changePasswordThunk, deleteProfileThunk } from "./thunks";
import { logout } from "../auth/authSlice";

export default function Perfil() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const token = useSelector((state) => state.auth.token);
    const { t, i18n } = useTranslation();

    const [modalType, setModalType] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);

    const [imgError, setImgError] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    useEffect(() => {
        setImgError(false);
    }, [user?.foto_perfil_url]);

    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    let imageUrl = null;

    if (user?.foto_perfil_url && user.foto_perfil_url !== "null" && user.foto_perfil_url !== "undefined") {
        const cleanPath = user.foto_perfil_url.replace(/\\/g, '/');
        imageUrl = cleanPath.startsWith('http') ? cleanPath : `${baseUrl}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
    }

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('languageSelected', lang);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImg(true);
        const formData = new FormData();
        formData.append('foto_perfil', file);

        try {
            await dispatch(updateProfilePhoto(formData)).unwrap();
        } catch (error) {
            console.error(error);
        }
        setUploadingImg(false);
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    const closeModal = () => {
        setModalType(null);
        setCurrentPassword('');
        setNewPassword('');
        setMsg({ type: '', text: '' });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setMsg({ type: '', text: '' });

        if (modalType === 'password') {
            if (!currentPassword || !newPassword) {
                setMsg({ type: 'error', text: 'Error' });
                setLoading(false); return;
            }
            try {
                await dispatch(changePasswordThunk({ currentPassword, newPassword })).unwrap();
                setMsg({ type: 'success', text: t('perfil.successChange') });
                setTimeout(() => closeModal(), 2000);
            } catch (error) {
                setMsg({ type: 'error', text: error === 'invalid_password' ? t('perfil.invalidPassword') : t('perfil.errorOccurred') });
            }
        } else if (modalType === 'delete') {
            if (!currentPassword) {
                setMsg({ type: 'error', text: 'Error' });
                setLoading(false); return;
            }
            try {
                await dispatch(deleteProfileThunk(currentPassword)).unwrap();
                dispatch(logout());
            } catch (error) {
                setMsg({ type: 'error', text: error === 'invalid_password' ? t('perfil.invalidPassword') : t('perfil.errorOccurred') });
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center py-6 pb-24 animate-in fade-in zoom-in-95 duration-500 relative">
            <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-xl border border-zinc-800/80 rounded-[2rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden group">

                <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-colors duration-700"></div>
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-700/10 blur-[80px] rounded-full group-hover:bg-emerald-600/10 transition-colors duration-700"></div>

                <div className="relative z-10 flex flex-col items-center">

                    <div
                        className="relative mb-6 group/avatar cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[20px] animate-[pulse_3s_ease-in-out_infinite]"></div>

                        <div className="relative z-10 w-32 h-32 rounded-full overflow-hidden border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-black">
                            {imageUrl && !imgError && !uploadingImg ? (
                                <img
                                    src={imageUrl}
                                    alt="Foto de perfil"
                                    onError={() => setImgError(true)}
                                    className="w-full h-full object-cover  "
                                />
                            ) : (
                                <div className="w-full h-full bg-zinc-900/80 flex items-center justify-center">
                                    {uploadingImg ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 border-solid"></div>
                                    ) : (
                                        <User size={48} className="text-zinc-500 drop-shadow-md" />
                                    )}
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <Camera size={32} className="text-white" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-md">{user?.nombre}</h1>

                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-8 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
                        <Shield size={14} className="text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">
                            {user?.rol === 'user' ? t('perfil.roleUser') || 'Usuario' : user?.rol === 'admin' ? t('perfil.roleAdmin') || 'Admin' : t('perfil.roleStaff') || 'Staff'}
                        </span>
                    </div>

                    <div className="w-full space-y-4 mb-8">
                        <div className="flex items-center p-4 bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors duration-300">
                            <Mail className="text-zinc-400 mr-4" size={24} />
                            <div className="flex-1">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Email</p>
                                <p className="text-sm font-medium text-zinc-200 truncate">{user?.email}</p>
                            </div>
                        </div>

                        {user?.rol === 'user' && (
                            <div className="flex items-center p-4 bg-emerald-950/20 backdrop-blur-sm rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors duration-300 relative overflow-hidden group/wallet">
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/wallet:opacity-100 transition-opacity"></div>
                                <Wallet className="text-emerald-500 mr-4 relative z-10" size={24} />
                                <div className="flex-1 relative z-10">
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-0.5">{t('perfil.balance') || 'Saldo'}</p>
                                    <p className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                                        {user?.saldo ?? 0} <span className="text-xs font-semibold opacity-60">{t('perfil.tokens') || 'Tokens'}</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-full border-t border-zinc-800/80 pt-6">
                        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Settings size={14} /> {t('perfil.settingsTitle') || 'Ajustes'}
                        </p>

                        <div className="space-y-3">
                            <div className="w-full flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-800 rounded-lg"><Globe size={18} className="text-zinc-300" /></div>
                                    <span className="text-sm font-medium text-zinc-300">{t('perfil.language') || 'Idioma'}</span>
                                </div>
                                <div className="flex bg-zinc-800/50 p-1 rounded-lg">
                                    {['es', 'en', 'ru'].map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => changeLanguage(lang)}
                                            className={`px-3 py-1 text-xs font-bold rounded-md uppercase transition-all ${i18n.language === lang ? 'bg-emerald-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={() => setModalType('password')} className="w-full flex items-center justify-between p-3.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/50 rounded-xl transition-all duration-300 group/btn">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-800 rounded-lg group-hover/btn:bg-zinc-700 transition-colors"><Key size={18} className="text-zinc-300" /></div>
                                    <span className="text-sm font-medium text-zinc-300">{t('perfil.changePassword') || 'Cambiar Contraseña'}</span>
                                </div>
                            </button>

                            <button onClick={handleLogout} className="w-full flex items-center justify-between p-3.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/50 rounded-xl transition-all duration-300 group/btn">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-800 rounded-lg group-hover/btn:bg-zinc-700 transition-colors"><LogOut size={18} className="text-zinc-300" /></div>
                                    <span className="text-sm font-medium text-zinc-300">{t('perfil.logout') || 'Cerrar Sesión'}</span>
                                </div>
                            </button>

                            <button onClick={() => setModalType('delete')} className="w-full flex items-center justify-between p-3.5 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 rounded-xl transition-all duration-300 group/btn mt-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-900/50 rounded-lg group-hover/btn:bg-red-800/50 transition-colors"><Trash2 size={18} className="text-red-400" /></div>
                                    <span className="text-sm font-bold text-red-400">{t('perfil.deleteAccount') || 'Eliminar Cuenta'}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {modalType && (
                <div
                    onClick={closeModal}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#111] border border-zinc-800 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative animate-in zoom-in-95 duration-300"
                    >
                        <button onClick={closeModal} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>

                        <div className="mb-6 flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${modalType === 'delete' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {modalType === 'delete' ? <Trash2 size={24} /> : <Key size={24} />}
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {modalType === 'delete' ? (t('perfil.deleteAccount') || 'Eliminar Cuenta') : (t('perfil.changePassword') || 'Cambiar Contraseña')}
                            </h3>
                        </div>

                        {modalType === 'delete' && (
                            <p className="text-sm text-zinc-400 mb-6 bg-red-950/30 border border-red-900/30 p-3 rounded-xl leading-relaxed">
                                {t('perfil.deleteWarning') || '¿Seguro que quieres eliminar?'}
                            </p>
                        )}

                        {msg.text && (
                            <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm font-semibold ${msg.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                {msg.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t('perfil.currentPassword') || 'Contraseña Actual'}</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-zinc-500 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>

                            {modalType === 'password' && (
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t('perfil.newPassword') || 'Nueva Contraseña'}</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`w-full mt-4 py-3.5 rounded-xl font-bold tracking-wide transition-all transform active:scale-95 ${modalType === 'delete'
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                    }`}
                            >
                                {loading ? '...' : (t('perfil.confirm') || 'Confirmar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}