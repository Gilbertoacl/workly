import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import api from "@/lib/api";
import InputField from "@/components/InputField";
import Loader from "@/components/Loader";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Campo obrigatório.";
    if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(form.email)) e.email = "E-mail inválido.";
    if (form.password.length < 8) e.password = "Senha precisa ter ao menos 8 caracteres.";
    if (form.password !== form.confirmPassword) e.confirmPassword = "As senhas não coincidem.";
    return e;
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const validation = validate();
    setErrors(validation);

    if (Object.keys(validation).length > 0) return;

    setLoading(true);

    try {
      await api.post("/Auth/register", { ...form, role: "USER" });
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 1300);
    } catch (err) {
      setServerError(err?.response?.data || "Erro inesperado.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4">
      <div className="w-full max-w-md bg-[#151B23] p-8 rounded-xl shadow-lg border border-[#222A33]">

        {/* Success State */}
        {success ? (
          <div className="text-center flex flex-col items-center animate-fade-in">
            <FiCheckCircle className="text-[#00D26A] text-5xl mb-3" />
            <h2 className="text-2xl font-bold text-white">Conta criada com sucesso!</h2>
            <p className="text-[#9CA3AF] mt-2">Agora você já pode realizar login.</p>

            <Link
              to="/login"
              className="mt-6 text-[#00D26A] font-medium hover:underline transition-colors"
            >
              Ir para o login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white text-center mb-6">Criar conta</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Server Error */}
              {serverError && (
                <p className="bg-[#FF4E4E]/15 text-[#FF4E4E] text-sm text-center p-2 rounded-md border border-[#FF4E4E]">
                  {serverError}
                </p>
              )}

              {/* Name */}
              <InputField
                label="Nome completo"
                type="text"
                value={form.name}
                error={errors.name}
                onChange={(v) => handleChange("name", v)}
              />

              {/* Email */}
              <InputField
                label="E-mail"
                type="email"
                value={form.email}
                error={errors.email}
                onChange={(v) => handleChange("email", v)}
              />

              {/* Password */}
              <InputField
                label="Senha"
                type={showPass ? "text" : "password"}
                value={form.password}
                error={errors.password}
                onChange={(v) => handleChange("password", v)}
                icon={showPass ? <FiEyeOff /> : <FiEye />}
                onIconClick={() => setShowPass(!showPass)}
              />

              {/* Confirm Password */}
              <InputField
                label="Confirmar senha"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                error={errors.confirmPassword}
                onChange={(v) => handleChange("confirmPassword", v)}
                icon={showConfirm ? <FiEyeOff /> : <FiEye />}
                onIconClick={() => setShowConfirm(!showConfirm)}
              />

              {/* Submit */}
              <button
                disabled={loading}
                className="w-full mt-2 bg-[#00D26A] hover:bg-[#00A556] text-[#0D1117] font-semibold py-3 rounded-md transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex gap-2 items-center justify-center">
                    <Loader /> Cadastrando...
                  </span>
                ) : (
                  "Criar conta"
                )}
              </button>

              <p className="text-center text-[#9CA3AF] mt-2">
                Já possui conta?{" "}
                <Link to="/login" className="text-[#00D26A] hover:underline">Entrar</Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}


