import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
    const remembered = JSON.parse(localStorage.getItem("rememberedAccount") || "{}");
    const [email, setEmail] = useState(remembered.email || "");
    const [password, setPassword] = useState(remembered.password || "");
    const [remember, setRemenber] = useState(!!remembered.remember);

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();
    
    const handleSubmit = (ev) => {
        ev.preventDefault();
        setSubmitted(true);

        if (remember) {
            localStorage.setItem("rememberedAccount", JSON.stringify({ email, password, remember:true }));
        } else {
            localStorage.removeItem("rememberedAccount");
        }

        let valid = true; 
        if (!email.includes("@")) {
            setEmailError("Digite um e-mail válido.");
            valid = false;
        } else {
            setEmailError("");
        }

        if (password.length < 8) {
            setPasswordError("A Senha deve ter pelo menos 8 caracteres.");
            valid = false;
        } else {
            setPasswordError("");
        }

        if (!valid) return;

        setLoading(true);
        setLoginError("");
        
        // Simulação de login assíncrono
        setTimeout(() => {
            setLoading(false);
            if (email !== "admin@email.com" || password !== "12345678") {
                setLoginError("Usuário ou senha inválidos.");
                return;
            }
            if (remember) {
                localStorage.setItem("rememberedAccount", JSON.stringify({ email, password, remember: true }));
            } else {
                localStorage.removeItem("rememberedAccount");
            }
            navigate("/home");
        }, 1200);
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-lg w-full">
                <div
                    style={{
                        boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    className="bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                >
                    <div className="p-8">
                        <h2 className="text-center text-3xl font-extrabold text-white">
                            Bem-vindo de volta
                        </h2>
                        <p className="mt-4 text-center text-gray-400">
                            Faça seu login
                        </p>
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            {loginError && (
                                <div className="text-red-400 text-center mb-2">{loginError}</div>
                            )}
                            <div className="rounded-md shadow-sm">
                                <div>
                                    <label className="sr-only" htmlFor="email">
                                        E-mail
                                    </label>
                                    <input
                                        placeholder="Email"
                                        className={`appearance-none relative block w-full px-3 py-3 border bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${submitted && emailError ? "border-red-500" : "border-gray-700"}`}
                                        required
                                        autoComplete="email"
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setEmailError("")}
                                    />
                                    {submitted && emailError && <span className="text-red-400 text-xs mt-1">{emailError}</span>}
                                </div>
                                <div className="mt-4">
                                    <label className="sr-only" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        placeholder="Password"
                                        className={`appearance-none relative block w-full px-3 py-3 border bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${submitted && passwordError ? "border-red-500" : "border-gray-700"}`}
                                        required
                                        autoComplete="current-password"
                                        type="password"
                                        name="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setPasswordError("")}
                                    />
                                    {submitted && passwordError && <span className="text-red-400 text-xs mt-1">{passwordError}</span>}
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
                                        onChange={(e) => setRemenber(e.target.checked)}
                                    />
                                    <label
                                        className="ml-2 block text-sm text-gray-400"
                                        htmlFor="remember-me"
                                    >Lembrar minha conta
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <Link
                                        className="font-medium text-indigo-500 hover:text-indigo-400"
                                        to="/forgot-password"
                                    >Esqueci minha senha!
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <button
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    type="submit"
                                    disabled={loading}
                                > {loading ? "Entrando..." : "Entrar"}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="px-8 py-4 bg-gray-700 text-center">
                        <span className="text-gray-400">Não possui uma conta? </span>
                        <Link
                            to="/register"
                            className="font-medium text-indigo-500 hover:text-indigo-400"
                        >Cadastre-se
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
