import { useDispatch } from "react-redux";
import { logout } from "./auth/authSlice";

export default function Home() {
    const dispatch = useDispatch();
    return (
        <div className="dark">
            <div className="text-text-primary min-h-screen">
                <h1 className="text-3xl font-bold underline">Hello world!</h1>
                <button onClick={() => dispatch(logout())}>Cerrar Sesión</button>
            </div>
        </div>
    );
}