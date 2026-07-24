import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import api from "./services/api";

function App() {
    useEffect(() => {
        // Fire-and-forget background ping to wake up backend (e.g. Render free tier) on initial app load
        api.get("/").catch(() => {});
    }, []);

    return (
        <ThemeProvider>
            <AuthProvider>
                <AppRoutes />
                <Toaster 
                    position="top-right" 
                    toastOptions={{
                        style: {
                            background: '#16181d',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                        },
                    }} 
                />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;