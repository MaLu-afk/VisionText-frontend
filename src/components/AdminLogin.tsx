import { useState } from 'react';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { adminLogin } from '../services/api';

interface AdminLoginProps {
    onLoginSuccess: (token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await adminLogin(username, password);
            localStorage.setItem('admin_token', response.access_token);
            onLoginSuccess(response.access_token);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red-600 to-brand-gold-500"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="bg-brand-red-50 p-3 rounded-full mb-4">
                        <Shield className="w-10 h-10 text-brand-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Panel de Administración</h2>
                    <p className="text-slate-500 text-sm mt-2">Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Usuario
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-red-600/20 focus:border-brand-red-600 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-red-600/20 focus:border-brand-red-600 outline-none transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-brand-red-600 mr-3 flex-shrink-0" />
                            <p className="text-sm text-brand-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 bg-brand-red-600 text-white rounded-xl font-medium hover:bg-brand-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-red-100 flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Verificando...
                            </>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
