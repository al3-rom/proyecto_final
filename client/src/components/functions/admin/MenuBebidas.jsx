import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, X, Save, ImagePlus, ArrowLeft, ArrowRight, ShoppingBag, AlertCircle, CheckCircle2, Search, FileDown, UploadCloud, Globe, Loader2, Check } from "lucide-react";
import { fetchProducts, createProduct, updateProduct, deleteProduct, bulkCreateProducts, deleteAllProducts, fetchCatalog } from "./thunks";

const LANGS = [
    { code: "es", labelKey: "admin.menu.langES" },
    { code: "ru", labelKey: "admin.menu.langRU" },
    { code: "en", labelKey: "admin.menu.langEN" },
];

const emptyTrans = () => ({ es: { nombre: "", descripcion: "" }, ru: { nombre: "", descripcion: "" }, en: { nombre: "", descripcion: "" } });

export default function MenuBebidas() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { products, productsStatus, catalog, catalogStatus } = useSelector((state) => state.admin);
    const user = useSelector((state) => state.auth.user);
    const adminLocalId = user?.local_id;
    const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

    const [search, setSearch] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [catalogModalOpen, setCatalogModalOpen] = useState(false);
    const [selectedCatalog, setSelectedCatalog] = useState([]);
    const [catalogSearch, setCatalogSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [step, setStep] = useState(0);
    const [translations, setTranslations] = useState(emptyTrans());
    const [precio, setPrecio] = useState("");
    const [tipo, setTipo] = useState("bebida");
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    useEffect(() => { 
        if (adminLocalId) dispatch(fetchProducts(adminLocalId)); 
    }, [dispatch, adminLocalId]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const openCreate = () => {
        setEditingProduct(null);
        setTranslations(emptyTrans());
        setPrecio("");
        setTipo("bebida");
        setPhotoFile(null);
        setPhotoPreview(null);
        setStep(0);
        setMsg({ type: "", text: "" });
        setModalOpen(true);
    };

    const openEdit = (product) => {
        const trans = emptyTrans();
        (product.Traduccion_productos || []).forEach((tr) => {
            if (trans[tr.codigo_idioma]) trans[tr.codigo_idioma] = { nombre: tr.nombre, descripcion: tr.descripcion };
        });
        setTranslations(trans);
        setPrecio(product.precio || "");
        setTipo(product.tipo || "bebida");
        setPhotoFile(null);
        setPhotoPreview(product.foto_url ? `${BASE_URL}${product.foto_url}` : null);
        setStep(0);
        setEditingProduct(product);
        setMsg({ type: "", text: "" });
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const setLangField = (lang, field, value) => setTranslations((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));

    const currentLang = LANGS[step].code;

    const currentStepValid = () => {
        const { nombre, descripcion } = translations[currentLang];
        if (step === 0 && !editingProduct && !photoFile) return false;
        return !!(nombre.trim() && descripcion.trim());
    };

    const allFieldsValid = () => LANGS.every((l) => translations[l.code].nombre.trim() && translations[l.code].descripcion.trim());

    const handleSubmit = async () => {
        const finalTranslations = LANGS.map((l) => ({ 
            codigo_idioma: l.code, 
            nombre: translations[l.code].nombre, 
            descripcion: translations[l.code].descripcion 
        }));
        const formData = new FormData();
        formData.append("local_id", adminLocalId);
        formData.append("precio", precio || 0);
        formData.append("tipo", tipo);
        formData.append("traducciones", JSON.stringify(finalTranslations));
        if (photoFile) formData.append("foto", photoFile);

        setLoading(true);
        try {
            if (editingProduct) await dispatch(updateProduct({ id: editingProduct.id, formData })).unwrap();
            else await dispatch(createProduct(formData)).unwrap();
            setMsg({ type: "success", text: t("admin.menu.createSuccess") });
            setTimeout(() => { closeModal(); }, 1500);
        } catch (err) {
            setMsg({ type: "error", text: err || t("auth.errors.unexpected") });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        setDeleting(true);
        try {
            await dispatch(deleteProduct(productToDelete.id)).unwrap();
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch (err) {
            alert(err);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteAll = async () => {
        setDeleting(true);
        try {
            await dispatch(deleteAllProducts(adminLocalId)).unwrap();
            setShowDeleteAllModal(false);
        } catch (err) {
            alert(err);
        } finally {
            setDeleting(false);
        }
    };

    const handleBulkImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const lines = text.split("\n").filter(l => l.trim());
            const headers = lines[0].split(";").map(h => h.trim().toLowerCase());
            const required = ["nombre_es", "descripcion_es", "nombre_ru", "descripcion_ru", "nombre_en", "descripcion_en", "precio"];
            if (!required.every(r => headers.includes(r))) {
                setMsg({ type: "error", text: t("admin.menu.bulkFormatError") });
                return;
            }
            const productsData = lines.slice(1).map(line => {
                const values = line.split(";").map(v => v.trim());
                const obj = {};
                headers.forEach((h, i) => { if (values[i]) obj[h] = values[i]; });
                return obj;
            });
            if (productsData.length === 0) return;
            setLoading(true);
            try {
                await dispatch(bulkCreateProducts({ products: productsData, local_id: adminLocalId })).unwrap();
                setMsg({ type: "success", text: t("admin.menu.bulkSuccess") });
                setTimeout(() => setBulkModalOpen(false), 2000);
            } catch (err) {
                setMsg({ type: "error", text: t("admin.menu.bulkError") });
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    const downloadTemplate = () => {
        const headers = "nombre_es;descripcion_es;nombre_ru;descripcion_ru;nombre_en;descripcion_en;precio";
        const sample = "Ron;Ron con cola;Рон;Рон с колой;Rum;Rum with coke;12.50";
        const blob = new Blob([`${headers}\n${sample}`], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "template_productos.csv";
        a.click();
    };

    const toggleCatalogSelection = (id) => setSelectedCatalog(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const handleImportSelected = async () => {
        if (selectedCatalog.length === 0) return;
        setLoading(true);
        try {
            for (const id of selectedCatalog) {
                const p = catalog.find(item => item.id === id);
                if (!p) continue;
                const trans = (p.Traduccion_productos || []).map(tr => ({ codigo_idioma: tr.codigo_idioma, nombre: tr.nombre, descripcion: tr.descripcion }));
                const formData = new FormData();
                formData.append("local_id", adminLocalId);
                formData.append("precio", p.precio || 0);
                formData.append("tipo", p.tipo || "bebida");
                formData.append("traducciones", JSON.stringify(trans));
                if (p.foto_url) formData.append("foto_url", p.foto_url);
                await dispatch(createProduct(formData)).unwrap();
            }
            setCatalogModalOpen(false);
            setSelectedCatalog([]);
        } catch (err) {
            alert(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = products
        .filter((p) => (p.Traduccion_productos || []).some(tr => tr.nombre.toLowerCase().includes(search.toLowerCase())))
        .sort((a, b) => {
            if (a.tipo === 'guardarropa' && b.tipo !== 'guardarropa') return -1;
            if (a.tipo !== 'guardarropa' && b.tipo === 'guardarropa') return 1;
            return 0;
        });

    return (
        <div className="p-4 md:p-8 pb-32 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 mt-4">
                <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <ShoppingBag size={32} className="text-emerald-500" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                            {t("admin.menu.title")}
                        </h1>
                    </div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                        {t("admin.menu.count", { count: products.length })}
                    </p>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-end gap-3">
                    {products.length > 0 && (
                        <button 
                            onClick={() => setShowDeleteAllModal(true)} 
                            className="p-4 bg-red-500/10 text-red-500 font-black rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300"
                            title={t("admin.menu.deleteAll")}
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button 
                        onClick={() => setBulkModalOpen(true)} 
                        className="flex items-center gap-2 px-5 py-4 bg-zinc-900 text-white font-black rounded-2xl border border-zinc-800 uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all shadow-lg"
                    >
                        <UploadCloud size={18} className="text-emerald-500" />
                        <span>{t("admin.menu.importBtn")}</span>
                    </button>
                    <button 
                        onClick={() => { dispatch(fetchCatalog()); setCatalogModalOpen(true); }} 
                        className="flex items-center gap-2 px-5 py-4 bg-zinc-900 text-white font-black rounded-2xl border border-zinc-800 uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all shadow-lg"
                    >
                        <Globe size={18} className="text-emerald-500" />
                        <span>{t("admin.menu.libraryBtn")}</span>
                    </button>
                    <button 
                        onClick={openCreate} 
                        className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-zinc-950 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={20} strokeWidth={3} />
                        {t("admin.menu.addBtn")}
                    </button>
                </div>
            </div>

            <div className="relative mb-8">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("admin.menu.searchPlaceholder")}
                    className="w-full bg-zinc-900/30 border border-zinc-800 text-white pl-14 pr-6 py-4 rounded-2xl focus:border-emerald-500/50 transition-all outline-none text-sm font-bold"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsStatus === "loading" && products.length === 0 ? (
                    <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <ShoppingBag size={48} className="text-zinc-800 mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-black text-zinc-600 uppercase tracking-tighter">{t("admin.menu.noProducts")}</h3>
                    </div>
                ) : (
                    filtered.map((product) => {
                        const tr = (product.Traduccion_productos || []).find((tr) => tr.codigo_idioma === i18n.language) || (product.Traduccion_productos || [])[0];
                        return (
                            <div key={product.id} className="group bg-zinc-900/30 border border-zinc-800 rounded-[2rem] overflow-hidden hover:border-emerald-500/30 transition-all shadow-xl flex flex-col">
                                <div className="relative aspect-square bg-zinc-950/50 flex items-center justify-center p-8">
                                    {product.foto_url ? (
                                        <img src={`${BASE_URL}${product.foto_url}`} alt={tr?.nombre} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                    ) : <ShoppingBag size={48} className="text-zinc-800 opacity-20" />}
                                    
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button onClick={() => openEdit(product)} className="p-3 bg-black/60 backdrop-blur-md rounded-xl text-zinc-400 hover:text-white transition-all shadow-lg border border-white/5"><Edit2 size={16} /></button>
                                        <button onClick={() => { setProductToDelete(product); setShowDeleteModal(true); }} className="p-3 bg-black/60 backdrop-blur-md rounded-xl text-red-500/70 hover:text-red-500 transition-all shadow-lg border border-white/5"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start gap-3 mb-4">
                                        <div className="min-w-0">
                                            <h3 className="font-black text-white text-lg truncate uppercase tracking-tight mb-1">{tr?.nombre}</h3>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${product.tipo === 'guardarropa' ? 'text-purple-400 border-purple-500/30 bg-purple-500/5' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'}`}>
                                                {product.tipo === 'guardarropa' ? t("admin.menu.typeGarderobe") : t("admin.menu.typeDrink")}
                                            </span>
                                        </div>
                                        <span className="text-emerald-400 font-black text-lg shrink-0 tracking-tighter">{product.precio}€</span>
                                    </div>
                                    <p className="text-zinc-500 text-xs line-clamp-2 font-bold mb-6 leading-relaxed opacity-80">{tr?.descripcion}</p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex gap-1.5">
                                            {LANGS.map(l => (
                                                <div key={l.code} className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${(product.Traduccion_productos || []).some(t => t.codigo_idioma === l.code) ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" : "border-zinc-800 text-zinc-700"}`}>{l.code}</div>
                                            ))}
                                        </div>
                                        <button onClick={() => openEdit(product)} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">{t("admin.menu.editBtn")}</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {modalOpen && (
                <div onClick={closeModal} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        <div className="p-6 md:p-10 pb-4">
                            <button onClick={closeModal} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
                            <div className="flex items-center gap-3 mb-6">
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">{editingProduct ? t("admin.menu.editTitle") : t("admin.menu.formTitle")}</h2>
                                <span className="px-3 py-1 bg-emerald-500 text-zinc-950 rounded-full text-[9px] font-black uppercase tracking-widest">{t(LANGS[step].labelKey)}</span>
                            </div>
                            <div className="flex gap-2 mb-6">
                                {LANGS.map((l, i) => (
                                    <button key={l.code} onClick={() => setStep(i)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${step === i ? "bg-emerald-500 text-zinc-950 shadow-lg" : "bg-zinc-900 text-zinc-500"}`}>{l.code}</button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-y-auto px-6 md:px-10 pb-10 space-y-6 flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {step === 0 && (
                                    <div className="space-y-6">
                                        <label className="cursor-pointer block">
                                            <div className={`aspect-square rounded-3xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center p-4 bg-zinc-950 ${photoPreview ? "border-emerald-500/30" : "border-zinc-800"}`}>
                                                {photoPreview ? <img src={photoPreview} alt="preview" className="max-w-full max-h-full object-contain" /> : <><ImagePlus size={32} className="text-zinc-700 mb-2" /><span className="text-[10px] font-black uppercase text-zinc-600">{t("admin.menu.photoPlaceholder")}</span></>}
                                            </div>
                                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">{t("admin.menu.priceLabel")}</label>
                                                <input type="number" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white px-5 py-3 rounded-xl focus:border-emerald-500/50 outline-none font-bold text-sm" placeholder="0.00" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">{t("admin.menu.typeLabel")}</label>
                                                <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white px-5 py-3 rounded-xl focus:border-emerald-500/50 outline-none font-bold text-sm appearance-none">
                                                    <option value="bebida">{t("admin.menu.typeDrink")}</option>
                                                    <option value="guardarropa">{t("admin.menu.typeGarderobe")}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className={step === 0 ? "space-y-6" : "col-span-full space-y-6"}>
                                    <div>
                                        <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">{t("admin.menu.nameLabel")} ({currentLang})</label>
                                        <input type="text" value={translations[currentLang].nombre} onChange={(e) => setLangField(currentLang, "nombre", e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white px-5 py-4 rounded-xl focus:border-emerald-500/50 outline-none font-bold text-sm" placeholder={t("admin.menu.namePlaceholder")} />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">{t("admin.menu.descLabel")} ({currentLang})</label>
                                        <textarea rows={step === 0 ? 4 : 8} value={translations[currentLang].descripcion} onChange={(e) => setLangField(currentLang, "descripcion", e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white px-5 py-4 rounded-xl focus:border-emerald-500/50 outline-none font-bold text-sm leading-relaxed resize-none" placeholder={t("admin.menu.descPlaceholder")} />
                                    </div>
                                </div>
                            </div>
                            {msg.text && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${msg.type === "error" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                                    {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                    {msg.text}
                                </div>
                            )}
                            <div className="flex gap-3 pt-6">
                                {step > 0 && <button onClick={() => setStep(step - 1)} className="px-6 py-4 bg-zinc-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest"><ArrowLeft size={16} /></button>}
                                {step < 2 ? (
                                    <button onClick={() => { if (!currentStepValid()) { setMsg({ type: "error", text: t("admin.menu.errorFillFields") }); return; } setMsg({ type: "", text: "" }); setStep(step + 1); }} className="flex-1 py-4 bg-zinc-800 text-white font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                        {t("admin.menu.nextBtn")} <ArrowRight size={16} />
                                    </button>
                                ) : (
                                    <button disabled={loading} onClick={() => { if (!allFieldsValid()) { setMsg({ type: "error", text: t("admin.menu.errorFillFields") }); return; } setShowConfirmModal(true); }} className="flex-1 py-4 bg-emerald-500 text-zinc-950 font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {t("admin.menu.createBtn")}</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div onClick={() => setShowDeleteModal(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto border border-red-500/20">
                            <Trash2 size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white text-center uppercase tracking-tighter mb-4">{t("admin.menu.deleteTitle")}</h2>
                        <p className="text-zinc-500 text-center font-bold text-sm mb-8 leading-relaxed uppercase tracking-wide">{t("admin.menu.deleteConfirmText")}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-zinc-900 text-zinc-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all border border-zinc-800">
                                {t("admin.menu.cancelBtn")}
                            </button>
                            <button disabled={deleting} onClick={handleDelete} className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2">
                                {deleting ? <Loader2 className="animate-spin" size={16} /> : t("admin.menu.deleteBtn")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteAllModal && (
                <div onClick={() => setShowDeleteAllModal(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto border border-red-500/20">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white text-center uppercase tracking-tighter mb-4">{t("admin.menu.deleteAllTitle")}</h2>
                        <p className="text-zinc-500 text-center font-bold text-sm mb-8 leading-relaxed uppercase tracking-wide">{t("admin.menu.deleteAllConfirmText")}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteAllModal(false)} className="flex-1 py-4 bg-zinc-900 text-zinc-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all border border-zinc-800">
                                {t("admin.menu.cancelBtn")}
                            </button>
                            <button disabled={deleting} onClick={handleDeleteAll} className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2">
                                {deleting ? <Loader2 className="animate-spin" size={16} /> : t("admin.menu.deleteBtn")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div onClick={() => setShowConfirmModal(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 mx-auto border border-emerald-500/20">
                            <Save size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{editingProduct ? t("admin.menu.confirmUpdateTitle") : t("admin.menu.confirmCreateTitle")}</h2>
                        <p className="text-zinc-500 font-bold text-sm mb-8 leading-relaxed uppercase tracking-wide">{t("admin.menu.confirmText")}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 bg-zinc-900 text-zinc-400 font-black rounded-2xl text-[10px] uppercase tracking-widest border border-zinc-800">
                                {t("admin.menu.cancelBtn")}
                            </button>
                            <button onClick={() => { setShowConfirmModal(false); handleSubmit(); }} className="flex-1 py-4 bg-emerald-500 text-zinc-950 font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                {t("admin.menu.confirmBtn")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {bulkModalOpen && (
                <div onClick={() => setBulkModalOpen(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 relative">
                        <button onClick={() => setBulkModalOpen(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                <UploadCloud size={24} />
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{t("admin.menu.bulkTitle")}</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl space-y-4">
                                <p className="text-xs font-bold text-zinc-400 leading-relaxed uppercase tracking-wide">{t("admin.menu.bulkInstructions")}</p>
                                <button onClick={downloadTemplate} className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">
                                    <FileDown size={16} /> {t("admin.menu.downloadTemplate")}
                                </button>
                            </div>
                            <label className="flex flex-col items-center justify-center w-full py-12 bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-3xl cursor-pointer hover:border-emerald-500/50 transition-all group">
                                <UploadCloud size={40} className="text-zinc-700 group-hover:text-emerald-500 transition-colors mb-4" />
                                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{t("admin.menu.uploadCSV")}</span>
                                <input type="file" accept=".csv" onChange={handleBulkImport} className="sr-only" />
                            </label>
                            {msg.text && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${msg.type === "error" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                                    {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                    {msg.text}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {catalogModalOpen && (
                <div onClick={() => setCatalogModalOpen(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-4xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        <div className="p-8 md:p-12 pb-6">
                            <button onClick={() => setCatalogModalOpen(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white transition-colors z-10"><X size={28} /></button>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                    <Globe size={32} />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">{t("admin.menu.catalogTitle")}</h2>
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{t("admin.menu.catalogSubtitle")}</p>
                                </div>
                            </div>
                            <div className="relative mb-6">
                                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="text"
                                    value={catalogSearch}
                                    onChange={(e) => setCatalogSearch(e.target.value)}
                                    placeholder={t("admin.menu.searchCatalog")}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white pl-14 pr-6 py-4 rounded-2xl focus:border-emerald-500/50 outline-none font-bold text-sm"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto px-8 md:px-12 pb-12 flex-1 custom-scrollbar">
                            {catalogStatus === "loading" ? (
                                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {catalog
                                        .filter(p => {
                                            const tr = (p.Traduccion_productos || []).find(t => t.codigo_idioma === 'es');
                                            const name = tr ? tr.nombre.toLowerCase().trim() : '';
                                            const matchesSearch = name.includes(catalogSearch.toLowerCase());
                                            
                                            const alreadyExists = products.some(localP => {
                                                const localTr = (localP.Traduccion_productos || []).find(t => t.codigo_idioma === 'es');
                                                return localTr && localTr.nombre.toLowerCase().trim() === name;
                                            });
                                            
                                            return matchesSearch && !alreadyExists;
                                        })
                                        .map(p => {
                                            const tr = (p.Traduccion_productos || []).find(t => t.codigo_idioma === i18n.language) || (p.Traduccion_productos || [])[0];
                                            const isSelected = selectedCatalog.includes(p.id);
                                            return (
                                                <div key={p.id} onClick={() => toggleCatalogSelection(p.id)} className={`group p-4 bg-zinc-950 border-2 rounded-3xl cursor-pointer transition-all flex items-center gap-4 ${isSelected ? "border-emerald-500 bg-emerald-500/5" : "border-zinc-900 hover:border-zinc-700"}`}>
                                                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center p-2 relative shrink-0">
                                                        {p.foto_url ? <img src={`${BASE_URL}${p.foto_url}`} alt={tr?.nombre} className="max-w-full max-h-full object-contain" /> : <ShoppingBag size={24} className="text-zinc-700" />}
                                                        {isSelected && <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-zinc-950 shadow-lg"><Check size={14} strokeWidth={4} /></div>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-white font-black uppercase text-xs truncate leading-tight mb-1">{tr?.nombre}</h3>
                                                        <span className="text-emerald-500 font-black text-xs">{p.precio}€</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                        <div className="p-8 md:p-12 pt-6 border-t border-zinc-900 flex justify-between items-center gap-6">
                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t("admin.menu.selectedCount", { count: selectedCatalog.length })}</span>
                            <div className="flex gap-4">
                                <button onClick={() => setCatalogModalOpen(false)} className="px-8 py-4 bg-zinc-950 text-zinc-400 font-black rounded-2xl text-[10px] uppercase tracking-widest border border-zinc-900 hover:bg-zinc-900 transition-all">{t("admin.menu.cancelBtn")}</button>
                                <button disabled={loading || selectedCatalog.length === 0} onClick={handleImportSelected} className="px-10 py-4 bg-emerald-500 text-zinc-950 font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2">
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <><Plus size={18} /> {t("admin.menu.importSelectedBtn")}</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
