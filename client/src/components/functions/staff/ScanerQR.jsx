import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Html5Qrcode } from "html5-qrcode";
import { useTranslation } from "react-i18next";
import { QrCode, CheckCircle, XCircle, Loader2, User, MapPin, ArrowLeft, RefreshCw, Camera, Upload } from "lucide-react";
import { fetchOrderByQR, validateOrder } from "./thunks";
import { setStatus, resetStaffState, setError } from "./staffSlice";

export default function ScanerQR() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { orderInfo, status, error, loading } = useSelector((state) => state.staff);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const html5QrCodeRef = useRef(null);
    const fileInputRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const BASE_URL = API_URL.replace("/api", "");

    
    const isSecure = window.isSecureContext;

    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(err => console.error(err));
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            dispatch(setStatus("scanning"));
            setIsCameraActive(true);
            
            
            setTimeout(async () => {
                const html5QrCode = new Html5Qrcode("reader");
                html5QrCodeRef.current = html5QrCode;
                
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                
                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        stopCamera();
                        dispatch(fetchOrderByQR(decodedText));
                    },
                    (errorMessage) => {
                        
                    }
                );
            }, 100);
        } catch (err) {
            console.error("Error starting camera:", err);
            dispatch(setError("scanner.cameraError"));
            setIsCameraActive(false);
        }
    };

    const stopCamera = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
        }
        setIsCameraActive(false);
        if (status === "scanning") dispatch(setStatus("idle"));
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        dispatch(setStatus("loading"));
        const html5QrCode = new Html5Qrcode("reader-hidden");
        try {
            const decodedText = await html5QrCode.scanFile(file, true);
            dispatch(fetchOrderByQR(decodedText));
        } catch (err) {
            console.error("Error scanning file:", err);
            dispatch(setError("scanner.noCodeFound"));
        }
    };

    const handleValidate = () => {
        if (orderInfo) {
            dispatch(validateOrder(orderInfo.id));
        }
    };

    const handleReset = () => {
        if (isCameraActive) stopCamera();
        dispatch(resetStaffState());
    };

    const getProductName = (order) => {
        const lang = i18n.language;
        const traducciones = order.producto?.Traduccion_productos;
        const trad = traducciones?.find(t => t.codigo_idioma === lang)
            || traducciones?.find(t => t.codigo_idioma === 'es');
        return trad?.nombre || "Producto";
    };

    const getProductDesc = (order) => {
        const lang = i18n.language;
        const traducciones = order.producto?.Traduccion_productos;
        const trad = traducciones?.find(t => t.codigo_idioma === lang)
            || traducciones?.find(t => t.codigo_idioma === 'es');
        return trad?.descripcion || "";
    };

    return (
        <div className="max-w-md mx-auto p-6 animate-in fade-in duration-500">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2">{t("scanner.title")}</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{t("scanner.subtitle")}</p>
            </header>

            {status === "idle" && (
                <div className="flex flex-col gap-4">
                    {!isSecure && (
                        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/50 rounded-2xl flex items-start gap-3">
                            <XCircle className="text-amber-500 shrink-0 mt-1" size={18} />
                            <p className="text-amber-200 text-xs font-medium">
                                {t("scanner.insecureWarning")}
                            </p>
                        </div>
                    )}
                    
                    <button 
                        onClick={startCamera}
                        className="w-full py-10 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all group"
                    >
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera size={32} className="text-emerald-500" />
                        </div>
                        <span className="text-white font-black text-lg tracking-tight">{t("scanner.startBtn")}</span>
                    </button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#050505] px-4 text-zinc-600 font-black tracking-widest">{t("scanner.orLabel")}</span></div>
                    </div>

                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="w-full py-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center gap-3 text-white font-bold hover:bg-zinc-800 transition-all"
                    >
                        <Upload size={20} className="text-emerald-500" />
                        {t("scanner.uploadBtn")}
                    </button>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    <div id="reader-hidden" className="hidden"></div>
                </div>
            )}

            {status === "scanning" && (
                <div className="animate-in zoom-in-95 duration-500">
                    <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)] aspect-square bg-black">
                        <div id="reader" className="w-full h-full"></div>
                        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-emerald-500 rounded-3xl pointer-events-none">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-lg"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-lg"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-lg"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-lg"></div>
                        </div>
                    </div>
                    <button 
                        onClick={handleReset}
                        className="w-full mt-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} /> {t("scanner.cancelBtn")}
                    </button>
                </div>
            )}

            {(status === "result" || status === "loading") && (
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-500">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{t("scanner.searching")}</p>
                        </div>
                    ) : orderInfo ? (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl">
                            <div className="aspect-[4/3] relative">
                                <img 
                                    src={orderInfo.producto?.foto_url ? `${BASE_URL}${orderInfo.producto.foto_url}` : "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"} 
                                    className="w-full h-full object-cover"
                                    alt="Producto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                                {orderInfo.validated_at && (
                                    <div className="absolute top-4 right-4 bg-red-500 text-white font-black px-4 py-2 rounded-xl shadow-lg animate-pulse">
                                        {t("scanner.alreadyValidated")}
                                    </div>
                                )}
                            </div>

                            <div className="p-8">
                                <h2 className="text-3xl font-black text-white mb-2">{getProductName(orderInfo)}</h2>
                                <p className="text-zinc-500 text-sm mb-8 leading-relaxed">{getProductDesc(orderInfo)}</p>

                                <div className="grid grid-cols-1 gap-4 mb-10">
                                    <div className="flex items-center gap-4 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                                            <User size={20} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{t("scanner.userLabel")}</p>
                                            <p className="text-white font-bold">{orderInfo.usuario?.nombre}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                                            <MapPin size={20} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{t("scanner.localLabel")}</p>
                                            <p className="text-white font-bold">{orderInfo.local?.nombre}</p>
                                        </div>
                                    </div>
                                </div>

                                {!orderInfo.validated_at ? (
                                    <button 
                                        onClick={handleValidate}
                                        disabled={loading}
                                        className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(16,185,129,0.3)] disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={24} />}
                                        {t("scanner.confirmBtn")}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleReset}
                                        className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3"
                                    >
                                        <RefreshCw size={24} />
                                        {t("scanner.scanAnother")}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {status === "success" && (
                <div className="text-center py-20 animate-in zoom-in-95 duration-500">
                    <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                        <CheckCircle size={64} className="text-zinc-950" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4">{t("scanner.successTitle")}</h2>
                    <p className="text-zinc-500 font-bold mb-12">{t("scanner.successMsg")}</p>
                    <button 
                        onClick={handleReset}
                        className="px-12 py-5 bg-white text-zinc-950 font-black rounded-2xl hover:bg-emerald-500 transition-all active:scale-95"
                    >
                        {t("scanner.scanNext")}
                    </button>
                </div>
            )}

            {status === "error" && (
                <div className="text-center py-20 animate-in zoom-in-95 duration-500">
                    <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                        <XCircle size={64} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4">{t("scanner.errorTitle")}</h2>
                    <p className="text-red-500 font-bold mb-12">{t(error)}</p>
                    <button 
                        onClick={handleReset}
                        className="px-12 py-5 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all"
                    >
                        {t("scanner.retryBtn")}
                    </button>
                </div>
            )}
        </div>
    );
}



