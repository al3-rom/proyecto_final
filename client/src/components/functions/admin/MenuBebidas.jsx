import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, X, Save, ImagePlus, ArrowLeft, ArrowRight, ShoppingBag, AlertCircle, CheckCircle2, Search, FileDown, UploadCloud } from "lucide-react";
import { fetchProducts, createProduct, updateProduct, deleteProduct, bulkCreateProducts, deleteAllProducts } from "./thunks";

const LANGS = [
    { code: "es", labelKey: "admin.menu.langES" },
    { code: "ru", labelKey: "admin.menu.langRU" },
    { code: "en", labelKey: "admin.menu.langEN" },
];

const emptyTrans = () => ({ es: { nombre: "", descripcion: "" }, ru: { nombre: "", descripcion: "" }, en: { nombre: "", descripcion: "" } });

export default function MenuBebidas() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { products, productsStatus } = useSelector((state) => state.admin);
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

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [step, setStep] = useState(0);
    const [translations, setTranslations] = useState(emptyTrans());
    const [precio, setPrecio] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const openCreate = () => {
        if (editingProduct !== null) {
            setTranslations(emptyTrans());
            setPrecio("");
            setPhotoFile(null);
            setPhotoPreview(null);
            setStep(0);
        }
        setEditingProduct(null);
        setMsg({ type: "", text: "" });
        setModalOpen(true);
    };

    const openEdit = (product) => {
        if (editingProduct?.id !== product.id) {
            const trans = emptyTrans();
            (product.Traduccion_productos || []).forEach((tr) => {
                if (trans[tr.codigo_idioma]) trans[tr.codigo_idioma] = { nombre: tr.nombre, descripcion: tr.descripcion };
            });
            setTranslations(trans);
            setPrecio(product.precio || "");
            setPhotoFile(null);
            setPhotoPreview(product.foto_url ? `${BASE_URL}${product.foto_url}` : null);
            setStep(0);
        }
        setEditingProduct(product);
        setMsg({ type: "", text: "" });
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const setLangField = (lang, field, value) =>
        setTranslations((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));

    const currentLang = LANGS[step].code;

    const currentStepValid = () => {
        const { nombre, descripcion } = translations[currentLang];
        if (step === 0 && !editingProduct && !photoFile) return false;
        return !!(nombre.trim() && descripcion.trim());
    };

    const allFieldsValid = () =>
        LANGS.every((l) => translations[l.code].nombre.trim() && translations[l.code].descripcion.trim());

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("local_id", adminLocalId);
        formData.append("precio", precio || 0);
        formData.append("traducciones", JSON.stringify(
            LANGS.map((l) => ({ codigo_idioma: l.code, nombre: translations[l.code].nombre, descripcion: translations[l.code].descripcion }))
        ));
        if (photoFile) formData.append("foto", photoFile);

        setLoading(true);
        try {
            if (editingProduct) {
                await dispatch(updateProduct({ id: editingProduct.id, formData })).unwrap();
                setMsg({ type: "success", text: t("admin.menu.updateSuccess") });
            } else {
                await dispatch(createProduct(formData)).unwrap();
                setMsg({ type: "success", text: t("admin.menu.createSuccess") });
            }
            setTimeout(() => {
                setTranslations(emptyTrans());
                setPrecio("");
                setPhotoFile(null);
                setPhotoPreview(null);
                setEditingProduct(null);
                setStep(0);
                closeModal();
            }, 1500);
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
            setMsg({ type: "success", text: t("admin.menu.deleteAllSuccess") });
            setTimeout(() => setMsg({ type: "", text: "" }), 3000);
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
            const hasAll = required.every(r => headers.includes(r));

            if (!hasAll) {
                setMsg({ type: "error", text: t("admin.menu.bulkFormatError") });
                return;
            }

            const products = lines.slice(1).map(line => {
                const values = line.split(";").map(v => v.trim());
                const obj = {};
                headers.forEach((h, i) => { if (values[i]) obj[h] = values[i]; });
                return obj;
            });

            if (products.length === 0) return;

            setLoading(true);
            try {
                await dispatch(bulkCreateProducts({ products, local_id: adminLocalId })).unwrap();
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

    const openBulkModal = () => {
        setMsg({ type: "", text: "" });
        setBulkModalOpen(true);
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

    const filtered = products.filter((p) => {
        const names = (p.Traduccion_productos || []).map((tr) => tr.nombre.toLowerCase()).join(" ");
        return names.includes(search.toLowerCase());
    });

    return (
        <div className="p-6 pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <ShoppingBag className="text-emerald-500" />
                        {t("admin.menu.title")}
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">{t("admin.menu.count", { count: products.length })}</p>
                </div>
                <div className="flex gap-3">
                    {products.length > 0 && (
                        <button
                            onClick={() => setShowDeleteAllModal(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl transition-all border border-red-500/20"
                        >
                            <Trash2 size={18} /> {t("admin.menu.deleteAll")}
                        </button>
                    )}
                    <button
                        onClick={openBulkModal}
                        className="flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all border border-zinc-800"
                    >
                        <UploadCloud size={18} /> {t("admin.menu.importBtn")}
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                        <Plus size={20} /> {t("admin.menu.addBtn")}
                    </button>
                </div>
            </div>

            <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("admin.menu.searchPlaceholder")}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-11 pr-5 py-3 rounded-2xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsStatus === "loading" && products.length === 0 ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500 border-solid"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-zinc-600 font-medium">{t("admin.menu.noProducts")}</div>
                ) : (
                    filtered.map((product) => {
                        const translationsArr = product.Traduccion_productos || [];
                        const currentTrans = translationsArr.find((tr) => tr.codigo_idioma === i18n.language) || 
                                           translationsArr.find((tr) => tr.codigo_idioma === "es") || 
                                           translationsArr[0];
                        const name = currentTrans?.nombre || "—";
                        const desc = currentTrans?.descripcion || "";
                        return (
                            <div key={product.id} className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 transition-all group relative">
                                <div className="relative h-56 bg-zinc-900/50 overflow-hidden flex items-center justify-center p-4">
                                    {product.foto_url ? (
                                        <img src={`${BASE_URL}${product.foto_url}`} alt={name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                            <ShoppingBag size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button onClick={() => openEdit(product)} className="p-2 bg-black/70 backdrop-blur-sm rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                                            <Edit2 size={15} />
                                        </button>
                                        <button onClick={() => { setProductToDelete(product); setShowDeleteModal(true); }} className="p-2 bg-black/70 backdrop-blur-sm rounded-xl text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-white truncate flex-1">{name}</h3>
                                        <span className="text-emerald-500 font-black text-sm shrink-0 ml-2">{product.precio}€</span>
                                    </div>
                                    <p className="text-zinc-500 text-sm line-clamp-2">{desc}</p>
                                    <div className="flex gap-1.5 mt-3">
                                        {LANGS.map((l) => {
                                            const has = (product.Traduccion_productos || []).some((tr) => tr.codigo_idioma === l.code);
                                            return (
                                                <span key={l.code} className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${has ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-900 text-zinc-600 border border-zinc-800"}`}>
                                                    {l.code}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {modalOpen && (
                <div onClick={closeModal} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0f0f0f] border border-zinc-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="p-8 pb-0">
                            <button onClick={closeModal} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-black text-white tracking-tight mb-1">
                                {editingProduct ? t("admin.menu.editTitle") : t("admin.menu.formTitle")}
                            </h2>
                            <div className="flex gap-2 mt-5 mb-6">
                                {LANGS.map((l, i) => (
                                    <button
                                        key={l.code}
                                        onClick={() => setStep(i)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${step === i ? "bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800"}`}
                                    >
                                        {t(l.labelKey)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-y-auto px-8 pb-8 space-y-5 flex-1">
                            {step === 0 && (
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">{t("admin.menu.photoLabel")}</label>
                                    <label className="cursor-pointer block">
                                        <div className={`relative rounded-2xl overflow-hidden border-2 border-dashed transition-all flex items-center justify-center p-2 bg-zinc-900/30 ${photoPreview ? "border-emerald-500/40" : "border-zinc-800 hover:border-zinc-600"}`} style={{ height: "220px" }}>
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="preview" className="max-w-full max-h-full object-contain" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-2 text-zinc-600">
                                                    <ImagePlus size={32} />
                                                    <span className="text-sm font-medium">{t("admin.menu.photoPlaceholder")}</span>
                                                </div>
                                            )}
                                            {photoPreview && (
                                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <ImagePlus size={28} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
                                    </label>
                                </div>
                            )}

                            {step > 0 && photoPreview && (
                                <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                                    <img src={photoPreview} alt="preview" className="w-12 h-12 object-cover rounded-xl" />
                                    <span className="text-zinc-400 text-sm">{t("admin.menu.photoLabel")}</span>
                                </div>
                            )}

                            {step === 0 && (
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 ml-1">{t("admin.menu.priceLabel")}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={precio}
                                        onChange={(e) => setPrecio(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                                        placeholder={t("admin.menu.pricePlaceholder")}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 ml-1">{t("admin.menu.nameLabel")}</label>
                                <input
                                    type="text"
                                    value={translations[currentLang].nombre}
                                    onChange={(e) => setLangField(currentLang, "nombre", e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                                    placeholder={t("admin.menu.namePlaceholder")}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 ml-1">{t("admin.menu.descLabel")}</label>
                                <textarea
                                    rows={3}
                                    value={translations[currentLang].descripcion}
                                    onChange={(e) => setLangField(currentLang, "descripcion", e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700 resize-none"
                                    placeholder={t("admin.menu.descPlaceholder")}
                                />
                            </div>

                            {msg.text && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${msg.type === "error" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                                    {msg.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                    {msg.text}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                {step > 0 && (
                                    <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all active:scale-95">
                                        <ArrowLeft size={18} /> {t("admin.menu.backBtn")}
                                    </button>
                                )}
                                {step < 2 ? (
                                    <button
                                        onClick={() => {
                                            if (!currentStepValid()) {
                                                const isPhotoMissing = step === 0 && !editingProduct && !photoFile;
                                                setMsg({ type: "error", text: isPhotoMissing ? t("admin.menu.errorNoPhoto") : t("admin.menu.errorFillFields") });
                                                return;
                                            }
                                            setMsg({ type: "", text: "" });
                                            setStep(step + 1);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all active:scale-95"
                                    >
                                        {t("admin.menu.nextBtn")} <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        disabled={loading}
                                        onClick={() => {
                                            if (!allFieldsValid()) {
                                                setMsg({ type: "error", text: t("admin.menu.errorFillFields") });
                                                return;
                                            }
                                            if (!editingProduct && !photoFile) {
                                                setStep(0);
                                                setMsg({ type: "error", text: t("admin.menu.errorNoPhoto") });
                                                return;
                                            }
                                            setShowConfirmModal(true);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.2)] disabled:opacity-50"
                                    >
                                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-zinc-950 border-solid"></div> : <><Save size={20} /> {t("admin.menu.createBtn")}</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div onClick={() => setShowConfirmModal(false)} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0f0f0f] border border-zinc-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                                <Save size={32} />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2">{editingProduct ? t("admin.menu.editTitle") : t("admin.menu.formTitle")}</h2>
                            <p className="text-zinc-500 text-sm mb-8">{t("admin.menu.confirmCreate")}</p>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button onClick={() => setShowConfirmModal(false)} className="py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all active:scale-95">
                                    {t("admin.menu.cancelBtn")}
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={() => { setShowConfirmModal(false); handleSubmit(); }}
                                    className="py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all active:scale-95 shadow-[0_10px_20px_rgba(16,185,129,0.2)] disabled:opacity-50 flex items-center justify-center"
                                >
                                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-zinc-950 border-solid"></div> : t("admin.menu.createBtn")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div onClick={() => setShowDeleteModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0f0f0f] border border-zinc-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                                <Trash2 size={32} />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2">{t("admin.menu.deleteTitle")}</h2>
                            <p className="text-zinc-500 text-sm mb-8">
                                {t("admin.menu.confirmDelete")}
                                <span className="block mt-2 text-zinc-600 italic">{t("admin.menu.deleteWarning")}</span>
                            </p>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button onClick={() => setShowDeleteModal(false)} className="py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all active:scale-95">
                                    {t("admin.menu.cancelBtn")}
                                </button>
                                <button disabled={deleting} onClick={handleDelete} className="py-3.5 bg-red-500 hover:bg-red-400 text-white font-black rounded-2xl transition-all active:scale-95 shadow-[0_10px_20px_rgba(239,68,68,0.2)] disabled:opacity-50 flex items-center justify-center">
                                    {deleting ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid"></div> : t("admin.menu.deleteBtn")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {bulkModalOpen && (
                <div onClick={() => setBulkModalOpen(false)} className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0f0f0f] border border-zinc-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setBulkModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
                                <UploadCloud size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">{t("admin.menu.bulkTitle")}</h2>
                            <p className="text-zinc-500 text-sm mt-1">{t("admin.menu.bulkSubtitle")}</p>
                        </div>

                        <div className="space-y-4 mb-8 bg-zinc-900/30 p-6 rounded-3xl border border-zinc-800/50">
                            <div className="flex gap-3">
                                <div className="mt-1"><AlertCircle size={16} className="text-emerald-500" /></div>
                                <p className="text-sm text-zinc-400 leading-relaxed">{t("admin.menu.bulkInstructions")}</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1"><AlertCircle size={16} className="text-emerald-500" /></div>
                                <p className="text-xs font-mono text-zinc-500 bg-black/30 p-3 rounded-xl border border-zinc-800 break-all">
                                    {t("admin.menu.bulkColumns")}
                                </p>
                            </div>
                            <button onClick={downloadTemplate} className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-2xl transition-all">
                                <FileDown size={18} /> {t("admin.menu.bulkTemplate")}
                            </button>
                        </div>

                        {msg.text && msg.type === "error" && (
                            <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                <AlertCircle size={18} />
                                {msg.text}
                            </div>
                        )}

                        <label className="cursor-pointer block">
                            <div className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all text-center flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(16,185,129,0.2)]">
                                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-zinc-950 border-solid"></div> : <><UploadCloud size={20} /> {t("admin.menu.importBtn")}</>}
                            </div>
                            <input type="file" accept=".csv" onChange={handleBulkImport} className="sr-only" disabled={loading} />
                        </label>
                    </div>
                </div>
            )}

            {showDeleteAllModal && (
                <div onClick={() => setShowDeleteAllModal(false)} className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#0f0f0f] border border-zinc-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                                <AlertCircle size={32} />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2">{t("admin.menu.deleteAll")}</h2>
                            <p className="text-zinc-500 text-sm mb-8">{t("admin.menu.deleteAllConfirm")}</p>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button onClick={() => setShowDeleteAllModal(false)} className="py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all active:scale-95">
                                    {t("admin.menu.cancelBtn")}
                                </button>
                                <button
                                    disabled={deleting}
                                    onClick={handleDeleteAll}
                                    className="py-3.5 bg-red-500 hover:bg-red-400 text-white font-black rounded-2xl transition-all active:scale-95 shadow-[0_10px_20px_rgba(239,68,68,0.2)] disabled:opacity-50 flex items-center justify-center"
                                >
                                    {deleting ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid"></div> : t("admin.menu.deleteBtn")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}