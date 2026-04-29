import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Html5Qrcode } from "html5-qrcode";
import { useTranslation } from "react-i18next";
import { QrCode, CheckCircle, XCircle, Loader2, User, MapPin, ArrowLeft, RefreshCw, Camera, Upload, Heart } from "lucide-react";
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
                await html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
                        stopCamera();
                        dispatch(fetchOrderByQR(decodedText));
                    }, () => {});
            }, 100);
        } catch (err) {
            dispatch(setError("scanner.cameraError"));
            setIsCameraActive(false);
        }
    };

    const stopCamera = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) await html5QrCodeRef.current.stop();
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
            dispatch(setError("scanner.noCodeFound"));
        }
    };

    const handleValidate = () => { if (orderInfo) dispatch(validateOrder(orderInfo.id)); };
    const handleReset = () => { if (isCameraActive) stopCamera(); dispatch(resetStaffState()); };

    const getProductName = (order) => {
        const trans = order.producto?.Traduccion_productos?.find(t => t.codigo_idioma === i18n.language) || order.producto?.Traduccion_productos?.find(t => t.codigo_idioma === 'es');
        return trans?.nombre || "Producto";
    };

    const getProductDesc = (order) => {
        const trans = order.producto?.Traduccion_productos?.find(t => t.codigo_idioma === i18n.language) || order.producto?.Traduccion_productos?.find(t => t.codigo_idioma === 'es');
        return trans?.descripcion || "";
    };

    return (
        <div className="max-w-md mx-auto p-4 md:p-6 pb-28 animate-in fade-in duration-500">
            <header className="mb-10 text-center mt-4">
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">{t("scanner.title")}</h1>
                <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">{t("scanner.subtitle")}</p>
            </header>

            {status === "idle" && (
                <div className="flex flex-col gap-4">
                    {!isSecure && (
                        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/50 rounded-2xl flex items-start gap-3">
                            <XCircle className="text-amber-500 shrink-0 mt-1" size={18} />
                            <p className="text-amber-200 text-[10px] font-black uppercase tracking-tight">{t("scanner.insecureWarning")}</p>
                        </div>
                    )}
                    <button onClick={startCamera} className="w-full py-12 bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 transition-all group active:scale-95">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/5">
                            <Camera size={40} className="text-emerald-500" />
                        </div>
                        <span className="text-white font-black text-lg uppercase tracking-tight">{t("scanner.startBtn")}</span>
                    </button>
                    <div className="relative py-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800/50"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#050505] px-4 text-zinc-600 font-black tracking-[0.3em]">{t("scanner.orLabel")}</span></div>
                    </div>
                    <button onClick={() => fileInputRef.current.click()} className="w-full py-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all active:scale-95">
                        <Upload size={18} className="text-emerald-500" />
                        {t("scanner.uploadBtn")}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                    <div id="reader-hidden" className="hidden"></div>
                </div>
            )}

            {status === "scanning" && (
                <div className="animate-in zoom-in-95 duration-500">
                    <div className="relative overflow-hidden rounded-[3rem] border-2 border-emerald-500/30 shadow-2xl aspect-square bg-black">
                        <div id="reader" className="w-full h-full"></div>
                        <div className="absolute inset-0 border-[60px] border-black/60 pointer-events-none"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-emerald-500/50 rounded-[2.5rem] pointer-events-none flex items-center justify-center">
                            <div className="w-full h-1 bg-emerald-500/50 absolute animate-scan"></div>
                        </div>
                    </div>
                    <button onClick={handleReset} className="w-full mt-8 py-5 bg-zinc-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl flex items-center justify-center gap-2"><ArrowLeft size={18} /> {t("scanner.cancelBtn")}</button>
                </div>
            )}

            {(status === "result" || status === "loading") && (
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-500">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                            <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">{t("scanner.searching")}</p>
                        </div>
                    ) : orderInfo ? (
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="aspect-square relative bg-zinc-950 flex items-center justify-center p-10">
                                <img src={orderInfo.producto?.foto_url ? `${BASE_URL}${orderInfo.producto.foto_url}` : ""} className="max-w-full max-h-full object-contain" alt="Producto" />
                                {orderInfo.validated_at && (
                                    <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                                        <span className="bg-red-500 text-white font-black px-6 py-3 rounded-2xl shadow-2xl uppercase text-xs tracking-widest">{t("scanner.alreadyValidated")}</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">{getProductName(orderInfo)}</h2>
                                    {Number(orderInfo.propina) > 0 && (
                                        <div className="bg-amber-500 text-zinc-950 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-2 animate-bounce">
                                            <Heart size={14} fill="currentColor" />
                                            +{orderInfo.propina}€
                                        </div>
                                    )}
                                </div>
                                <p className="text-zinc-500 text-xs font-bold mb-8 leading-relaxed uppercase tracking-tight">{getProductDesc(orderInfo)}</p>
                                <div className="space-y-3 mb-10">
                                    <div className="flex items-center gap-4 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><User size={18} /></div>
                                        <div><p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{t("scanner.userLabel")}</p><p className="text-white font-black uppercase text-xs">{orderInfo.usuario?.nombre}</p></div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><MapPin size={18} /></div>
                                        <div><p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{t("scanner.localLabel")}</p><p className="text-white font-black uppercase text-xs">{orderInfo.local?.nombre}</p></div>
                                    </div>
                                </div>
                                {!orderInfo.validated_at ? (
                                    <button onClick={handleValidate} disabled={loading} className="w-full py-5 bg-emerald-500 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 uppercase text-xs tracking-widest">
                                        {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />} {t("scanner.confirmBtn")}
                                    </button>
                                ) : (
                                    <button onClick={handleReset} className="w-full py-5 bg-zinc-900 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
                                        <RefreshCw size={20} /> {t("scanner.scanAnother")}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {status === "success" && (
                <div className="text-center py-20 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30">
                        <CheckCircle size={48} className="text-zinc-950" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter leading-none">{t("scanner.successTitle")}</h2>
                    <p className="text-zinc-500 font-bold mb-6 uppercase text-[10px] tracking-widest">{t("scanner.successMsg")}</p>
                    
                    {Number(orderInfo?.propina) > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl mb-12 animate-in slide-in-from-bottom-4 duration-700">
                            <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{t("scanner.tipReceived") || "¡HAS RECIBIDO PROPINA!"}</p>
                            <p className="text-3xl font-black text-white">+{orderInfo.propina}€</p>
                        </div>
                    )}

                    <button onClick={handleReset} className="w-full py-5 bg-white text-zinc-950 font-black rounded-2xl active:scale-95 uppercase text-xs tracking-widest">{t("scanner.scanNext")}</button>
                </div>
            )}

            {status === "error" && (
                <div className="text-center py-20 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/30">
                        <XCircle size={48} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter leading-none">{t("scanner.errorTitle")}</h2>
                    <p className="text-red-500 font-black mb-12 uppercase text-[10px] tracking-widest">{t(error)}</p>
                    <button onClick={handleReset} className="w-full py-5 bg-zinc-900 text-white font-black rounded-2xl uppercase text-xs tracking-widest">{t("scanner.retryBtn")}</button>
                </div>
            )}
        </div>
    );
}
