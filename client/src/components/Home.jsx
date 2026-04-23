import { useDispatch, useSelector } from "react-redux";
import { logout } from "./auth/authSlice";
import { useNavigate } from "react-router-dom";
import Nav from "./main/Nav";
import { Routes, Route } from "react-router-dom";
import Lugares from "./functions/user/Lugares";
import ListaBebidas from "./functions/user/ListaBebidas";
import Perfil from "./functions/Perfil";
import Error from "./functions/Error";
import MenuBebidas from "./functions/admin/MenuBebidas";
import Employers from "./functions/admin/Employers";
import ScanerQR from "./functions/staff/ScanerQR";


export default function Home() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const role = user.rol;

    return (
        <div className="dark relative min-h-screen bg-[#050505] font-sans text-white">

            <div className="fixed inset-0 z-0 pointer-events-none flex flex-col justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a0a] via-[#050505] to-black opacity-95"></div>

                <div className="absolute top-[20%] left-[10%] w-[20vw] h-[20vw] rounded-full bg-emerald-500/10 blur-[80px] animate-[pulse_10s_ease-in-out_infinite] pointer-events-none mix-blend-screen"></div>

                <div className="absolute top-[60%] right-[15%] w-[15vw] h-[15vw] rounded-full bg-emerald-400/5 blur-[90px] animate-[pulse_15s_ease-in-out_infinite] pointer-events-none mix-blend-screen" style={{ animationDelay: '3s' }}></div>

                <div className="absolute top-[-5%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-emerald-600/5 blur-[100px] animate-[pulse_12s_ease-in-out_infinite] pointer-events-none mix-blend-screen" style={{ animationDelay: '6s' }}></div>

                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-20"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Nav />
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 md:pb-12 relative z-10">
                    <Routes>
                        {role === 'user' && (
                            <>
                                <Route path="/" element={<Lugares />} />
                                <Route path="/bebidas" element={<ListaBebidas />} />
                            </>
                        )}
                        {role === 'admin' && (
                            <>
                                <Route path="/" element={<Employers />} />
                                <Route path="/admin/empleados" element={<Employers />} />
                                <Route path="/admin/menu" element={<MenuBebidas />} />
                            </>
                        )}
                        {role === 'staff' && (
                            <>
                                <Route path="/" element={<ScanerQR />} />
                            </>
                        )}
                        <Route path="/perfil" element={<Perfil />} />
                        <Route path="*" element={<Error />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}