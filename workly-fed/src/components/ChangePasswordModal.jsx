import { useState } from "react";
import { updatePassword } from "@/features/services/userService";
import { FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePasswords = () => {
    if (
      !form.currentPassword ||
      !form.newPassword ||
      !form.confirmNewPassword
    ) {
      return "Todos os campos são obrigatórios.";
    }

    if (form.newPassword.length < 8) {
      return "A nova senha deve conter ao menos 8 caracteres.";
    }

    if (form.newPassword !== form.confirmNewPassword) {
      return "As senhas não coincidem.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validatePasswords();
    if (error) return setPasswordError(error);
    setPasswordError("");

    try {
      await updatePassword(form);
      setSuccess(true)
    } catch (err) {
      console.log("Erro : "+ err)
      setPasswordError("Senha atual inválida.")
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-surfaceAlt border border-border rounded-lg p-6 w-full max-w-md text-textPrimary shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>

        {passwordError && (
          <div
            className={`text-center font-semibold tracking-wider p-2 rounded mb-3 text-sm ${
              passwordError.type === "success"
                ? "bg-green-800 text-green-200"
                : "bg-red-900 text-red-200"
            }`}
          >
            {passwordError}
          </div>
        )}

        {success ? (
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            <div className="flex flex-col items-center justify-center">
              <FiCheckCircle
                className="text-green-400 text-5xl mb-2"
                aria-hidden="true"
              />
              <h2 className="text-center text-2xl font-extrabold text-white flex items-center gap-2">
                Senha Alterada com sucesso!
              </h2>
            </div>
            <button
                type="button"
                className="wi-full px-4 py-2 border border-gray-700 rounded text-textSecondary hover:bg-surface transition"
                onClick={onClose}
              >
                Fechar
              </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                id="currentPasswor"
                type={showPassword ? "text" : "password"}
                placeholder="Senha atual"
                className="w-full p-2 rounded bg-surface text-textPrimary border border-border outline-none"
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
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

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nova senha"
                className="w-full p-2 rounded bg-surface text-textPrimary border border-border outline-none"
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
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

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirme a nova senha"
                className="w-full p-2 rounded bg-surface text-textPrimary border border-border outline-none"
                onChange={(e) =>
                  setForm({ ...form, confirmNewPassword: e.target.value })
                }
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

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 border border-border rounded text-textSecondary hover:bg-surface transition"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white transition"
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
