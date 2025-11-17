import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
    const remembered = JSON.parse(localStorage.getItem("rememberedAccount") || "{}");
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
        const emailRegex = /^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,6}(\.[a-zA-Z]{2,6})?$/;
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
        } else setEmailError("");

        if (!validatePassword(password)) {
            setPasswordError("A senha deve ter pelo menos 8 caracteres.");
            valid = false;
        } else setPasswordError("");

        if (!valid) return;

        setLoading(true);

        try {
            await login(email, password);

            remember
                ? localStorage.setItem("rememberedAccount", JSON.stringify({ email, password, remember: true }))
                : localStorage.removeItem("rememberedAccount");

            navigate("/home");
        } catch (error) {
            setLoginError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0D1117] px-4">
            <div className="w-full max-w-md">
                <div className="bg-[#151B23] border border-gray-700 rounded-xl shadow-2xl p-6 sm:p-8 transition-transform duration-300 hover:-translate-y-1">
                    
                    <h2 className="text-center text-3xl font-bold text-white mb-2">
                        Bem-vindo de volta
                    </h2>
                    <p className="text-center text-[#9CA3AF] mb-6">
                        Faça login para continuar
                    </p>

                    {/* Error Box */}
                    {loginError && (
                        <div className="bg-[#FF4E4E]/15 border border-[#FF4E4E] text-[#FF4E4E] rounded-lg p-2 text-sm text-center mb-4 animate-pulse">
                            {loginError}
                            {loginError.includes("Usuário ou Senha inválidos.") && (
                                <div className="mt-2">
                                    <Link to="/register" className="text-[#00D26A] underline hover:text-[#00A556]">Criar nova conta</Link> ou
                                    <Link to="/forgot-password" className="text-[#00D26A] underline ml-1 hover:text-[#00A556]">Recuperar senha</Link>
                                </div>
                            )}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        
                        {/* EMAIL */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                                E-mail <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setEmailError("")}
                                placeholder="Digite seu e-mail"
                                className={`w-full px-3 py-3 rounded-md bg-[#0D1117] text-white border 
                                ${submitted && emailError ? "border-[#FF4E4E]" : "border-gray-700"} 
                                focus:outline-none focus:ring-2 focus:ring-[#00D26A]`}
                            />
                            {submitted && emailError && (
                                <small className="text-[#FF4E4E]">{emailError}</small>
                            )}
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                                Senha <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setPasswordError("")}
                                    placeholder="Digite sua senha"
                                    className={`w-full pr-10 px-3 py-3 rounded-md bg-[#0D1117] text-white border 
                                    ${submitted && passwordError ? "border-[#FF4E4E]" : "border-gray-700"} 
                                    focus:outline-none focus:ring-2 focus:ring-[#00D26A]`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-white"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {submitted && passwordError && (
                                <small className="text-[#FF4E4E]">{passwordError}</small>
                            )}
                        </div>

                        {/* REMEMBER */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-[#9CA3AF] text-sm cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="accent-[#00D26A] w-4 h-4"
                                />
                                Lembrar minha conta
                            </label>
                            <Link to="/forgot-password" className="text-[#00D26A] text-sm hover:text-[#00A556]">
                                Esqueci minha senha
                            </Link>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#00D26A] text-black font-bold py-3 rounded-md hover:bg-[#00A556] 
                            transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </form>

                    {/* REGISTER */}
                    <p className="text-center text-[#9CA3AF] mt-6">
                        Não possui uma conta?{" "}
                        <Link to="/register" className="text-[#00D26A] hover:text-[#00A556] font-medium">
                            Cadastre-se
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
