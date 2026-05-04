import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, Mail, Wallet, Shield, Settings, LogOut, Key, Trash2, X, CheckCircle2, AlertCircle, Globe, Camera, CreditCard, Banknote, Plus, Eye, EyeOff, Heart, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchUserProfile, updateProfilePhoto, changePasswordThunk, deleteProfileThunk, recargarSaldoThunk } from "./thunks";
import { logout } from "../auth/authSlice";
import LegalModal from "../auth/LegalModal";

export default function Perfil() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
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
    const [showLegal, setShowLegal] = useState(false);
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
        navigate('/login', { replace: true });
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
                setMsg({ type: 'error', text: t('auth.errors.unexpected') });
                setLoading(false); return;
            }
            try {
                await dispatch(changePasswordThunk({ currentPassword, newPassword })).unwrap();
                setMsg({ type: 'success', text: t('perfil.successChange') });
                setTimeout(() => closeModal(), 2000);
            } catch (error) {
                setMsg({ type: 'error', text: error === 'invalid_password' ? t('perfil.invalidPassword') : t('auth.errors.unexpected') });
            }
        } else if (modalType === 'delete') {
            if (!currentPassword) {
                setMsg({ type: 'error', text: t('auth.errors.unexpected') });
                setLoading(false); return;
            }
            try {
                await dispatch(deleteProfileThunk(currentPassword)).unwrap();
                dispatch(logout());
            } catch (error) {
                setMsg({ type: 'error', text: error === 'invalid_password' ? t('perfil.invalidPassword') : t('auth.errors.unexpected') });
            }
        } else if (modalType === 'recharge') {
            if (!rechargeAmount || rechargeAmount <= 0 || rechargeAmount > 500) {
                setMsg({ type: 'error', text: t('perfil.invalidAmount') });
                setLoading(false); return;
            }
            try {
                await dispatch(recargarSaldoThunk(rechargeAmount)).unwrap();
                setMsg({ type: 'success', text: t('perfil.rechargeSuccess') });
                setTimeout(() => closeModal(), 2000);
            } catch (error) {
                setMsg({ type: 'error', text: t(error) });
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center py-4 md:py-10 pb-28 md:pb-12 animate-in fade-in zoom-in-95 duration-500 relative px-4">
            <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-xl border border-zinc-700/80 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[20px] animate-pulse"></div>
                        <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-emerald-700/40 bg-black shadow-xl">
                            {imageUrl && !imgError && !uploadingImg ? (
                                <img src={imageUrl} alt="Profile" onError={() => setImgError(true)} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-900/80 flex items-center justify-center">
                                    {uploadingImg ? <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div> : <User size={48} className="text-zinc-500" />}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <Camera size={32} className="text-white" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2 uppercase">{user?.nombre}</h1>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-8">
                        <Shield size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">
                            {user?.rol === 'user' ? t('perfil.roleUser') : user?.rol === 'admin' ? t('perfil.roleAdmin') : user?.rol === 'superadmin' ? t('perfil.roleSuper') : t('perfil.roleStaff')}
                        </span>
                    </div>

                    <div className="w-full space-y-4 mb-8">
                        <div className="flex items-center p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                            <Mail className="text-zinc-500 mr-4 shrink-0" size={20} />
                            <div className="overflow-hidden">
                                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">Email</p>
                                <p className="text-sm font-bold text-zinc-200 truncate">{user?.email}</p>
                            </div>
                        </div>

                        {(user?.rol === 'user' || user?.rol === 'staff') && (
                            <div 
                                onClick={() => user?.rol === 'user' && setModalType('recharge')} 
                                className={`flex items-center p-4 bg-emerald-950/20 rounded-2xl border border-emerald-500/20 transition-all group/wallet ${user?.rol === 'user' ? 'hover:border-emerald-500/40 cursor-pointer active:scale-95' : ''}`}
                            >
                                <Wallet className="text-emerald-500 mr-4 shrink-0" size={20} />
                                <div className="flex-1">
                                    <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mb-0.5">{t('perfil.balance')}</p>
                                    <p className="text-2xl font-black text-emerald-400">
                                        {Number(user?.saldo ?? 0).toFixed(2)} <span className="text-xs font-bold opacity-60">{t('perfil.tokens')}</span>
                                    </p>
                                </div>
                                {user?.rol === 'user' && <Plus size={20} className="text-emerald-500" />}
                            </div>
                        )}
                    </div>

                    {user?.rol === 'staff' && (
                        <div className="w-full mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-200">
                            <button
                                onClick={() => navigate('/staff/propinas')}
                                className="w-full flex items-center justify-between p-5 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/30 rounded-2xl hover:border-emerald-500/60 hover:from-emerald-500/20 transition-all duration-300 active:scale-[0.98] group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                                        <Heart size={22} fill="currentColor" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">{t('perfil.tipHistory')}</p>
                                        <p className="text-white font-black text-sm uppercase tracking-tight">{t('perfil.viewTipHistory') || 'Ver historial completo'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ChevronRight size={18} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </div>
                    )}

                    <div className="w-full border-t border-zinc-800/80 pt-6">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Settings size={14} /> {t('perfil.settingsTitle')}
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-800 rounded-lg"><Globe size={16} className="text-zinc-300" /></div>
                                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-tight">{t('perfil.language')}</span>
                                </div>
                                <div className="flex bg-zinc-800/50 p-1 rounded-lg">
                                    {['es', 'en', 'ru'].map(lang => (
                                        <button key={lang} onClick={() => changeLanguage(lang)} className={`px-3 py-1 text-[10px] font-black rounded-md uppercase transition-all ${i18n.language === lang ? 'bg-emerald-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}>
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setModalType('password')} className="w-full flex items-center justify-between p-3.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/50 rounded-xl transition-all active:scale-[0.98]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-800 rounded-lg"><Key size={16} className="text-zinc-300" /></div>
                                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-tight">{t('perfil.changePassword')}</span>
                                </div>
                            </button>
                            <button onClick={handleLogout} className="w-full flex items-center justify-between p-3.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/50 rounded-xl transition-all active:scale-[0.98]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-800 rounded-lg"><LogOut size={16} className="text-zinc-300" /></div>
                                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-tight">{t('perfil.logout')}</span>
                                </div>
                            </button>
                            {user?.rol === 'user' && (
                                <button onClick={() => setModalType('delete')} className="w-full flex items-center justify-between p-3.5 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 rounded-xl transition-all active:scale-[0.98] mt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-900/50 rounded-lg"><Trash2 size={16} className="text-red-400" /></div>
                                        <span className="text-xs font-black text-red-400 uppercase tracking-tight">{t('perfil.deleteAccount')}</span>
                                    </div>
                                </button>
                            )}
                            <div className="pt-4 flex flex-col gap-3">
                                <button onClick={() => setShowLegal(true)} className="w-full text-center text-[10px] font-black text-zinc-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">
                                    {t('perfil.terms')}
                                </button>
                                <button onClick={() => setShowLegal(true)} className="w-full text-center text-[10px] font-black text-zinc-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">
                                    {t('perfil.privacy')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LegalModal isOpen={showLegal} onClose={() => setShowLegal(false)} />

            {modalType && (
                <div onClick={closeModal} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={closeModal} className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors"><X size={24} /></button>
                        <div className="mb-6 flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${modalType === 'delete' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {modalType === 'delete' ? <Trash2 size={24} /> : modalType === 'recharge' ? <CreditCard size={24} /> : <Key size={24} />}
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                {modalType === 'delete' ? t('perfil.deleteAccount') : modalType === 'recharge' ? t('perfil.rechargeBalance') : t('perfil.changePassword')}
                            </h3>
                        </div>

                        {modalType === 'delete' && <p className="text-xs text-zinc-400 mb-6 bg-red-950/30 border border-red-900/30 p-4 rounded-2xl leading-relaxed font-bold">{t('perfil.deleteWarning')}</p>}
                        {msg.text && (
                            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-tight ${msg.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {msg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                {msg.text}
                            </div>
                        )}

                        {modalType === 'recharge' && (
                            <div className="space-y-6 mb-8">
                                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Banknote className="text-emerald-500" size={24} />
                                        <div>
                                            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{t('perfil.currentBalance')}</p>
                                            <p className="text-xl font-black text-white">{Number(user?.saldo ?? 0).toFixed(2)} <span className="text-xs opacity-50">€</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">{t('perfil.selectAmount')}</label>
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        {[10, 50, 100, 500].map(amount => (
                                            <button key={amount} onClick={() => setRechargeAmount(amount)} className={`py-3 rounded-xl text-xs font-black border transition-all ${Number(rechargeAmount) === amount ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'}`}>
                                                {amount}€
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <input type="number" value={rechargeAmount} onChange={(e) => setRechargeAmount(e.target.value > 500 ? 500 : e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-emerald-500 text-sm font-bold" placeholder={t('perfil.otherAmount')} max="500" min="1" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {modalType !== 'recharge' && (
                            <div className="space-y-5 mb-8">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{t('perfil.currentPassword')}</label>
                                    <div className="relative">
                                        <input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-emerald-500 text-sm" placeholder="••••••••" />
                                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">{showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                    </div>
                                </div>
                                {modalType === 'password' && (
                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{t('perfil.newPassword')}</label>
                                        <div className="relative">
                                            <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-emerald-500 text-sm" placeholder="••••••••" />
                                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button onClick={handleSubmit} disabled={loading} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${modalType === 'delete' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20'} disabled:opacity-50`}>
                            {loading ? '...' : t('perfil.confirm')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
