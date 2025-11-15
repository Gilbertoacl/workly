import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import api from "@/lib/api";
import { HttpStatusCode } from "axios";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function validade() {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Nome obrigatório.";
    const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email))
      newErrors.email = "E-mail inválido.";
    if (password.length < 8)
      newErrors.password = "Senha deve ter pelo menos 8 caracteres.";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "As senhas não coincidem.";
    return newErrors;
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitted(true);
    setServerError("");
    const validation = validade();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setLoading(true);

    api.post("/Auth/register", {name, email, password, role: "USER"})
    .then(() => {
      setTimeout(() => {
        setSuccess(true)
        setLoading(false)
      }, 2000);
    })
    .catch((error) => {
      setLoading(false);
      setServerError(error.response.data);
    });
    
    
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
          {success ? (
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center justify-center">
                <FiCheckCircle className="text-green-400 text-5xl mb-2" aria-hidden="true" />
                <h2 className="text-center text-3xl font-extrabold text-white flex items-center gap-2">
                  Cadastro realizado!
                </h2>
              </div>
              <p className="mt-4 text-center text-gray-400">
                Você ja pode fazer o login.
              </p>
              <div className="mt-8 text-center">
                <Link to="/login" className="text-indigo-400 hover:underline">
                  Ir para o login
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <h2 className="text-center text-3xl font-extrabold text-white">
                Criar conta
              </h2>
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {serverError && (
                  <div className="bg-red-500/10 border border-red-500 text-red-400 rounded p-2 text-sm mb-2 text-center" role="alert" aria-live="assertive">
                    {serverError}
                  </div>
                )}
                <div className="rounded-md space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="name">
                      Nome Completo <span className="text-red-400">*</span>
                    </label>
                    <input
                      placeholder="Nome Completo"
                      className={`appearance-none relative block w-full px-3 py-3 border bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                        submitted && errors.name
                          ? "border-red-500"
                          : "border-gray-700"
                      }`}
                      required
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setErrors({ ...errors, name: "" })}
                      aria-invalid={!!errors.name}
                      aria-describedby="name-error"
                    />
                    {submitted && errors.name && (
                      <span
                        id="name-error"
                        className="text-red-400 text-xs mt-1 block"
                        aria-live="polite"
                      >
                        {errors.name}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
                      E-mail <span className="text-red-400">*</span>
                    </label>
                    <input
                      placeholder="E-mail"
                      className={`appearance-none relative block w-full px-3 py-3 border bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                        submitted && errors.email
                          ? "border-red-500"
                          : "border-gray-700"
                      }`}
                      required
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setErrors({ ...errors, email: "" })}
                      aria-invalid={!!errors.email}
                      aria-describedby="email-error"
                    />
                    {submitted && errors.email && (
                      <span
                        id="email-error"
                        className="text-red-400 text-xs mt-1 block"
                        aria-live="polite"
                      >
                        {errors.email}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
                      Senha <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        placeholder="Senha"
                        className={`appearance-none relative block w-full px-3 py-3 border bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                          submitted && errors.password
                            ? "border-red-500"
                            : "border-gray-700"
                        } pr-10`}
                        required
                        autoComplete="new-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setErrors({ ...errors, password: "" })}
                        aria-invalid={!!errors.password}
                        aria-describedby="password-error"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none z-20"
                        tabIndex={0}
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {submitted && errors.password && (
                      <span
                        id="password-error"
                        className="text-red-400 text-xs mt-1 block"
                        aria-live="polite"
                      >
                        {errors.password}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="confirmPassword">
                      Confirmar senha <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        placeholder="Confirmar Senha"
                        className={`appearance-none relative block w-full px-3 py-3 border bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                          submitted && errors.confirmPassword
                            ? "border-red-500"
                            : "border-gray-700"
                        } pr-10`}
                        required
                        autoComplete="new-password"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() =>
                          setErrors({ ...errors, confirmPassword: "" })
                        }
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby="confirmPassword-error"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none z-20"
                        tabIndex={0}
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={
                          showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {submitted && errors.confirmPassword && (
                      <span
                        id="confirmPassword-error"
                        className="text-red-400 text-xs mt-1 block"
                        aria-live="polite"
                      >
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 mt-2 sm:mt-0"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <svg
                          className="animate-spin h-5 w-5 text-gray-900"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Cadastrando...
                      </span>
                    ) : (
                      "Cadastrar"
                    )}
                  </button>
                </div>
                <div className="text-center mt-4">
                  <p>
                    Já possui conta?{" "}
                    <Link
                      to="/login"
                      className="text-indigo-400 hover:underline"
                    >
                      Entrar
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
