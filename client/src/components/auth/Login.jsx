import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./thunks";
import { useEffect, useState } from "react";
import { setError } from "./authSlice";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Login() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const credentials = {
            email: email,
            password: password
        };
        dispatch(login(credentials));
    };

    const { error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (error) {
            setTimeout(() => {
                dispatch(setError(null));
            }, 3000);
        }
    }, [error]);

    const { isAuthenticated } = useSelector((state) => state.auth);
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated]);


    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 font-sans">
            <div className="max-w-md w-full bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-zinc-700 shadow-2xl">

                <div className="p-8 sm:p-10">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">{t('auth.login.title')}</h1>
                        <p className="text-zinc-500 text-sm font-medium">{t('auth.login.subtitle')}</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-950/40 border border-red-500/50 rounded-2xl flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                            <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            <span className="text-sm font-semibold text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">{error === "Incorrect password" ? t('auth.errors.loginIncorrect') : t('auth.errors.unexpected')}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1" htmlFor="email">{t('auth.login.emailLabel')}</label>
                            <input
                                id="email"
                                type="email"
                                placeholder={t('auth.login.emailPlaceholder')}
                                name="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-white placeholder-zinc-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-300"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1" htmlFor="password">{t('auth.login.passwordLabel')}</label>
                            <div className="relative w-full">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('auth.login.passwordPlaceholder')}
                                    name="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-white placeholder-zinc-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-300 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-zinc-600 hover:text-white transition-colors outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                className="w-full bg-emerald-500/90 hover:bg-emerald-400 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 active:scale-[0.98] border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-0.5"
                            >
                                {t('auth.login.submitBtn')}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="px-8 py-6 bg-[#050505] border-t border-zinc-900 text-center">
                    <p className="text-sm text-zinc-500">
                        {t('auth.login.noAccount')}{' '}
                        <Link to="/register" className="font-semibold text-white hover:text-zinc-300 transition-colors">
                            {t('auth.login.registerLink')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}