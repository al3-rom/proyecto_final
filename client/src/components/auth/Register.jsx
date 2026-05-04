import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setError } from "./authSlice";
import { register } from "./thunks";
import { useEffect, useState } from "react";
import { Eye, EyeOff, AlertCircle, ImagePlus, CheckCircle, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import LegalModal from "./LegalModal";
import Logotipo from "../../assets/LogoFull.png";

export default function Register() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fileName, setFileName] = useState("");
    const [showLegal, setShowLegal] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (password !== confirmPassword) {
            dispatch(setError("auth.errors.passwordsMismatch"));
            return;
        }

        const formData = new FormData();
        formData.append('nombre', e.target.nombre.value);
        formData.append('email', e.target.email.value);
        formData.append('password', password);
        if (e.target.foto_perfil.files[0]) {
            formData.append('foto_perfil', e.target.foto_perfil.files[0]);
        }
        dispatch(register(formData));
    };

    const { error, isAuthenticated, status } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/perfil");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (error) {
            setTimeout(() => {
                dispatch(setError(null));
            }, 3000);
        }
    }, [error]);



    return (
        <div className="min-h-screen flex items-center justify-center text-white p-4 font-sans relative">
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50">
                <button
                    onClick={() => {
                        localStorage.removeItem('languageSelected');
                        window.location.reload();
                    }}
                    className="flex text-zinc-500 hover:text-emerald-400 p-2.5 rounded-full border border-zinc-800 hover:border-emerald-500/50 bg-[#0a0a0a] shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300"
                    title="Change Language"
                >
                    <Globe className="w-5 h-5 hover:rotate-12 transition-transform duration-300" />
                </button>
            </div>

            <div className="max-w-xl w-full bg-[#0a0a0a]/95 backdrop-blur-3xl rounded-[2rem] overflow-hidden border border-zinc-800 border-t-zinc-700 shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.2)] transition-shadow duration-500">

                <div className="p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                            <img src={Logotipo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1.5">{t('auth.register.title')}</h1>
                        <p className="text-zinc-500 text-sm font-medium">{t('auth.register.subtitle')}</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-950/40 border border-red-500/50 rounded-2xl flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                            <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            <span className="text-sm font-semibold text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
                                {t(error)}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1 ml-1" htmlFor="nombre">{t('auth.register.nameLabel')}</label>
                                <input
                                    id="nombre"
                                    type="text"
                                    placeholder={t('auth.register.namePlaceholder')}
                                    name="nombre"
                                    required
                                    className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-2.5 text-white placeholder-zinc-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1 ml-1" htmlFor="email">{t('auth.login.emailLabel')}</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder={t('auth.login.emailPlaceholder')}
                                    name="email"
                                    required
                                    className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-2.5 text-white placeholder-zinc-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-300"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1 ml-1" htmlFor="password">{t('auth.login.passwordLabel')}</label>
                            <div className="relative w-full">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('auth.login.passwordPlaceholder')}
                                    name="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-2.5 text-white placeholder-zinc-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-300 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-zinc-600 hover:text-white transition-colors outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1 ml-1" htmlFor="confirmPassword">{t('auth.register.confirmPasswordLabel')}</label>
                            <div className="relative w-full">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder={t('auth.login.passwordPlaceholder')}
                                    name="confirmPassword"
                                    required
                                    minLength={6}
                                    className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-2.5 text-white placeholder-zinc-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-300 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-zinc-600 hover:text-white transition-colors outline-none"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1 ml-1" htmlFor="foto_perfil">{t('auth.register.photoLabel')}</label>
                            <label className={`flex items-center justify-center w-full bg-black border rounded-2xl px-4 py-3 text-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all duration-300 cursor-pointer border-dashed ${fileName ? 'border-emerald-500/50 bg-emerald-950/10 hover:bg-emerald-950/20' : 'border-zinc-800 hover:border-zinc-700 hover:bg-[#0f0f0f]'}`}>
                                <div className={`flex items-center gap-2 text-center transition-colors duration-200 ${fileName ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'}`}>
                                    {fileName ? (
                                        <CheckCircle className="h-5 w-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    ) : (
                                        <ImagePlus className="h-5 w-5" />
                                    )}
                                    <div className="text-sm font-medium truncate max-w-[200px] sm:max-w-[250px]">
                                        {fileName || t('auth.register.photoUpload')}
                                    </div>
                                </div>
                                <input
                                    id="foto_perfil"
                                    type="file"
                                    name="foto_perfil"
                                    accept="image/*"
                                    onChange={(e) => setFileName(e.target.files[0]?.name || "")}
                                    className="sr-only"
                                />
                            </label>
                        </div>

                        <div className="flex items-center gap-3 pt-2 pb-2">
                            <div className="flex items-center h-5 mt-0.5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="w-5 h-5 appearance-none bg-black border-2 border-zinc-700 rounded-md checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer transition-all flex items-center justify-center after:content-[''] after:w-2 after:h-3 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 after:opacity-0 checked:after:opacity-100 after:-mt-1"
                                />
                            </div>
                            <label htmlFor="terms" className="text-sm font-medium text-zinc-400 select-none leading-tight">
                                {t('auth.register.acceptTerms')}
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setShowLegal(true); }}
                                    className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-400 transition-colors ml-1"
                                >
                                    {t('auth.register.privacyPolicy')}
                                </button>
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-emerald-500/90 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 active:scale-[0.98] border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        {t('auth.register.loading') || 'Cargando...'}
                                    </>
                                ) : (
                                    t('auth.register.submitBtn')
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="px-8 py-4 bg-[#050505] border-t border-zinc-900 text-center">
                    <p className="text-sm text-zinc-500">
                        {t('auth.register.hasAccount')}{' '}
                        <Link to="/login" className="font-semibold text-white hover:text-zinc-300 transition-colors">
                            {t('auth.register.loginLink')}
                        </Link>
                    </p>
                </div>
            </div>

            <LegalModal isOpen={showLegal} onClose={() => setShowLegal(false)} />
        </div>
    );
}



