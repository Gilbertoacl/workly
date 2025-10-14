import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
    const remembered = JSON.parse(localStorage.getItem("rememberedAccount") || "{}" );
    const [email, setEmail] = useState(remembered.email || "");
    const [password, setPassword] = useState(remembered.password || "");
    const [remember, setRemember] = useState(!!remembered.remember);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    function validateEmail(email) {
        const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
    function validatePassword(password) {
        return password.length >= 8;
    }

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setSubmitted(true);
        setLoginError("");
        let valid = true;

        if (!validateEmail(email)) {
            setEmailError("Digite um e-mail válido.");
            valid = false;
        } else {
            setEmailError("");
        }

        if (!validatePassword(password)) {
            setPasswordError("A senha deve ter pelo menos 8 caracteres.");
            valid = false;
        } else {
            setPasswordError("");
        }

        if (!valid) return;

        setLoading(true);

        try {
            await login(email, password);

            (remember) ? localStorage.setItem("rememberedAccount", JSON.stringify({ email, password, remember: true })) : localStorage.removeItem("rememberedAccount");
           
            navigate("/home");
        } catch (error) {
            setLoginError(error.message); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-2 sm:px-0">
            <div className="max-w-lg w-full">
                <div
                    style={{
                        boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    className="bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                >
                    <div className="p-6 sm:p-8">
                        <h2 className="text-center text-3xl font-extrabold text-white">
                            Bem-vindo de volta
                        </h2>
                        <p className="mt-4 text-center text-gray-400">
                            Faça seu login
                        </p>
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            {loginError && (
                                <div className="bg-red-500/10 border border-red-500 text-red-400 rounded p-2 text-sm mb-2 text-center" role="alert" aria-live="assertive">
                                    {loginError}
                                    {loginError.includes("Usuário ou Senha inválidos.") && (
                                        <div className="mt-2">
                                            <Link to="/register" className="text-indigo-400 underline">Criar nova conta</Link> ou
                                            <Link to="/forgot-password" className="text-indigo-400 underline ml-1">Recuperar senha</Link>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="rounded-md space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
                                        E-mail <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        placeholder="E-mail"
                                        className={`appearance-none relative block w-full px-3 py-3 border bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${submitted && emailError ? "border-red-500" : "border-gray-700"}`}
                                        required
                                        autoComplete="email"
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setEmailError("")}
                                        aria-invalid={!!emailError}
                                        aria-describedby="email-error"
                                    />
                                    {submitted && emailError && (
                                        <span id="email-error" className="text-red-400 text-xs mt-1 block" aria-live="polite">{emailError}</span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
                                        Senha <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            placeholder="Senha"
                                            className={`appearance-none relative block w-full px-3 py-3 border bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${submitted && passwordError ? "border-red-500" : "border-gray-700"} pr-10`}
                                            required
                                            autoComplete="current-password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setPasswordError("")}
                                            aria-invalid={!!passwordError}
                                            aria-describedby="password-error"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none z-20"
                                            tabIndex={0}
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    {submitted && passwordError && (
                                        <span id="password-error" className="text-red-400 text-xs mt-1 block" aria-live="polite">{passwordError}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center">
                                    <input
                                        className="h-4 w-4 text-indigo-500 focus:ring-indigo-400 border-gray-600 rounded"
                                        type="checkbox"
                                        name="remember-me"
                                        id="remember-me"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        aria-checked={remember}
                                    />
                                    <label className="ml-2 block text-sm text-gray-400" htmlFor="remember-me">
                                        Lembrar minha conta
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <Link className="font-medium text-indigo-500 hover:text-indigo-400" to="/forgot-password">
                                        Esqueci minha senha!
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <button
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 mt-2 sm:mt-0"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Entrando..." : "Entrar"}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="px-6 sm:px-8 py-4 bg-gray-700 text-center">
                        <span className="text-gray-400">Não possui uma conta? </span>
                        <Link to="/register" className="font-medium text-indigo-500 hover:text-indigo-400">
                            Cadastre-se
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
