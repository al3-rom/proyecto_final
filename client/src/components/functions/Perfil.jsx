import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { User, Mail, Wallet, Shield, Settings, LogOut, Key, Trash2, X, CheckCircle2, AlertCircle, Globe, Camera, CreditCard, Banknote, Plus, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchUserProfile, updateProfilePhoto, changePasswordThunk, deleteProfileThunk, recargarSaldoThunk } from "./thunks";
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
    const [rechargeAmount, setRechargeAmount] = useState(50);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

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
        setRechargeAmount(50);
        setMsg({ type: '', text: '' });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
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
        } else if (modalType === 'recharge') {
            if (!rechargeAmount || rechargeAmount <= 0 || rechargeAmount > 500) {
                setMsg({ type: 'error', text: t('perfil.invalidAmount') || 'Cantidad inválida. Máx 500€.' });
                setLoading(false); return;
            }
            try {
                await dispatch(recargarSaldoThunk(rechargeAmount)).unwrap();
                setMsg({ type: 'success', text: t('perfil.rechargeSuccess') || `¡Recargaste ${rechargeAmount} Tokens con éxito!` });
                setTimeout(() => closeModal(), 2000);
            } catch (error) {
                setMsg({ type: 'error', text: t('perfil.errorOccurred') || 'Error al recargar.' });
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center py-6 pb-24 animate-in fade-in zoom-in-95 duration-500 relative">
            <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-xl border border-zinc-700/80 rounded-[2rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden group">

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

                        <div className="relative z-10 w-40 h-40 rounded-full overflow-hidden border-2 border-emerald-700/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-black">
                            {imageUrl && !imgError && !uploadingImg ? (
                                <img
                                    src={imageUrl}
                                    alt="Foto de perfil"
                                    onError={() => setImgError(true)}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-zinc-900/80 flex items-center justify-center">
                                    {uploadingImg ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-700 border-solid"></div>
                                    ) : (
                                        <User size={64} className="text-zinc-500 drop-shadow-md" />
                                    )}
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <Camera size={36} className="text-white" />
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
                            <div
                                onClick={() => setModalType('recharge')}
                                className="flex items-center p-4 bg-emerald-950/20 backdrop-blur-sm rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors duration-300 relative overflow-hidden group/wallet cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/wallet:opacity-100 transition-opacity"></div>
                                <Wallet className="text-emerald-500 mr-4 relative z-10" size={24} />
                                <div className="flex-1 relative z-10">
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-0.5">{t('perfil.balance') || 'Saldo'} <span className="lowercase text-[9px] opacity-70 ml-1">{t('perfil.clickToRecharge')}</span></p>
                                    <p className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                                        {Number(user?.saldo ?? 0).toFixed(2)} <span className="text-xs font-semibold opacity-60">{t('perfil.tokens') || '€'}</span>
                                    </p>
                                </div>
                                <Plus size={20} className="text-emerald-500 opacity-0 group-hover/wallet:opacity-100 transition-opacity absolute right-6" />
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

                            {user?.rol === 'user' && (
                                <button onClick={() => setModalType('delete')} className="w-full flex items-center justify-between p-3.5 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 rounded-xl transition-all duration-300 group/btn mt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-900/50 rounded-lg group-hover/btn:bg-red-800/50 transition-colors"><Trash2 size={18} className="text-red-400" /></div>
                                        <span className="text-sm font-bold text-red-400">{t('perfil.deleteAccount') || 'Eliminar Cuenta'}</span>
                                    </div>
                                </button>
                            )}
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

                        <div className="mb-4 flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${modalType === 'delete' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {modalType === 'delete' ? <Trash2 size={24} /> : modalType === 'recharge' ? <CreditCard size={24} /> : <Key size={24} />}
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {modalType === 'delete' ? (t('perfil.deleteAccount') || 'Eliminar Cuenta') : modalType === 'recharge' ? (t('perfil.rechargeBalance') || 'Recargar Saldo') : (t('perfil.changePassword') || 'Cambiar Contraseña')}
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

                        {modalType === 'recharge' && (
                            <div className="space-y-4 mb-6">
                                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Banknote className="text-emerald-500" size={24} />
                                        <div>
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{t('perfil.currentBalance') || 'Saldo actual'}</p>
                                            <p className="text-xl font-black text-white">{Number(user?.saldo ?? 0).toFixed(2)} <span className="text-sm font-semibold opacity-60">{t('perfil.tokens') || '€'}</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">{t('perfil.selectAmount') || 'Selecciona cantidad'}</label>
                                    <div className="grid grid-cols-4 gap-2 mb-3">
                                        {[10, 50, 100, 500].map(amount => (
                                            <button
                                                key={amount}
                                                onClick={() => setRechargeAmount(amount)}
                                                className={`py-2 rounded-xl text-sm font-bold border transition-all ${Number(rechargeAmount) === amount ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)] scale-105' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-500'} active:scale-95`}
                                            >
                                                {amount} €
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative mt-2">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-zinc-500 font-bold">€</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={rechargeAmount}
                                            onChange={(e) => setRechargeAmount(e.target.value > 500 ? 500 : e.target.value)}
                                            className="w-full bg-zinc-900/80 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-600"
                                            placeholder={t('perfil.otherAmount') || 'Otra cantidad...'}
                                            max="500"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {modalType !== 'recharge' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t('perfil.currentPassword') || 'Contraseña Actual'}</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:border-zinc-500 transition-colors"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {modalType === 'password' && (
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t('perfil.newPassword') || 'Nueva Contraseña'}</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {modalType === 'recharge' ? (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !rechargeAmount || rechargeAmount <= 0}
                                className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold tracking-wide transition-all transform active:scale-95 bg-white hover:bg-gray-200 text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:active:scale-100"
                            >
                                {loading ? '...' : (
                                    <>
                                        <svg viewBox="0 0 384 512" className="h-5 w-5 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.9 87.2-87.3 100.9-114.7-47-21.7-60.5-62.9-60-104zM226.7 93.6c20.3-24.9 31.5-55.6 28.3-86.6-28.5 1.5-61 18.5-81.2 43.1-20.9 24.9-31.5 56.4-28.3 87.3 30.6 2.3 62-17.3 81.2-43.8z" /></svg>
                                        Pay {rechargeAmount || 0} {t('perfil.tokens') || '€'}
                                    </>
                                )}
                            </button>
                        ) : (
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
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}