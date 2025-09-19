import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateEmail(email) {
    const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validateEmail(email)) {
      setEmailError("Digite um e-mail válido.");
      return;
    }
    setEmailError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
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
          {submitted ? (
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center justify-center">
                <FiCheckCircle className="text-green-400 text-5xl mb-2" aria-hidden="true" />
                <h2 className="text-center text-3xl font-extrabold text-white flex items-center gap-2">
                  Email enviado!
                </h2>
              </div>
              <p className="mt-4 text-center text-gray-400">
                Entre na sua caixa de email e defina uma nova senha.
              </p>
              <div className="mt-8 text-center">
                <Link to="/login" className="text-indigo-400 hover:underline">Voltar para login</Link>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <h2 className="text-center text-3xl font-extrabold text-white">
                Esqueceu sua senha ?
              </h2>
              <p className="mt-4 text-center text-gray-400">
                Digite seu e-mail que enviaremos um link para definir uma nova senha.
              </p>
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="rounded-md space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
                      E-mail <span className="text-red-400">*</span>
                    </label>
                    <input
                      placeholder="E-mail"
                      className={`appearance-none relative block w-full px-3 py-3 border bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${emailError ? "border-red-500" : "border-gray-700"}`}
                      required
                      autoComplete="email"
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setEmailError("")}
                      aria-invalid={!!emailError}
                      aria-describedby="email-error"
                    />
                    {emailError && <span id="email-error" className="text-red-400 text-xs mt-1 block" aria-live="polite">{emailError}</span>}
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
                        <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                        Enviando...
                      </span>
                    ) : "Enviar"}
                  </button>
                </div>
                <div className="text-center mt-4">
                  <Link to="/login" className="text-indigo-400 hover:underline">Voltar para login</Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
