import { useState } from "react";
import { updatePassword } from "@/features/services/userService";
import { FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePasswords = () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmNewPassword)
      return "Todos os campos são obrigatórios.";

    if (form.newPassword.length < 8)
      return "A nova senha deve conter ao menos 8 caracteres.";

    if (form.newPassword !== form.confirmNewPassword)
      return "As senhas não coincidem.";

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validatePasswords();
    if (error) return setPasswordError(error);

    try {
      await updatePassword(form);
      setSuccess(true);
    } catch {
      setPasswordError("Senha atual inválida.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-surfaceAlt border border-border rounded-xl p-6 w-full max-w-md text-textPrimary shadow-xl">

        <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>

        {passwordError && (
          <div className="p-2 rounded text-sm font-semibold bg-red-900 text-red-200 mb-3 text-center">
            {passwordError}
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center gap-6 py-6">
            <FiCheckCircle className="text-green-400 text-5xl" />
            <h2 className="text-center text-xl font-bold">Senha alterada com sucesso!</h2>

            <button
              onClick={onClose}
              className="
                w-full px-4 py-2 rounded-lg font-semibold border border-accent text-accent
                hover:bg-accent hover:text-gray-900 transition-all duration-200
              "
            >
              Fechar
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {["currentPassword", "newPassword", "confirmNewPassword"].map((field, i) => (
              <div key={i} className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    field === "currentPassword"
                      ? "Senha atual"
                      : field === "newPassword"
                      ? "Nova senha"
                      : "Confirmar nova senha"
                  }
                  className="
                    w-full p-3 rounded-lg bg-surface border border-border text-textPrimary
                    focus:border-accent focus:ring-2 focus:ring-accent/40 outline-none transition
                  "
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="
                  px-4 py-2 rounded-lg font-semibold border border-border text-textSecondary
                  hover:bg-surface transition duration-200
                "
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="
                  px-5 py-2 rounded-lg font-semibold shadow-sm
                  bg-primary text-gray-900 hover:bg-primary-hover
                  transition-all duration-200
                "
              >
                Alterar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
