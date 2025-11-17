import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import InputField from "@/components/InputField";
import Loader from "@/components/Loader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (!/^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/.test(email)) {
      setError("Digite um e-mail válido.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4">
      <div className="max-w-md w-full bg-[#151B23] p-8 rounded-xl border border-[#222A33] shadow-lg">

        {submitted ? (
          <div className="text-center animate-fade-in">
            <FiCheckCircle className="text-[#00D26A] text-5xl mb-3" />
            <h2 className="text-2xl font-bold text-white">E-mail enviado!</h2>
            <p className="text-[#9CA3AF] mt-2">
              Verifique sua caixa de entrada para redefinir sua senha.
            </p>
            <Link to="/login" className="mt-6 inline-block text-[#00D26A] hover:underline">
              Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Esqueceu sua senha?</h2>
            <p className="text-center text-[#9CA3AF] text-sm mb-6">
              Informe seu e-mail e enviaremos o link de recuperação.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                error={error}
              />

              <button
                disabled={loading}
                className="w-full bg-[#00D26A] hover:bg-[#00A556] text-[#0D1117] font-semibold py-3 rounded-md transition disabled:opacity-50"
              >
                {loading ? <span className="flex gap-2 items-center justify-center"><Loader /> Enviando...</span> : "Enviar"}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-[#00D26A] hover:underline">
                  Voltar ao login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

