import { useState } from "react";
import { updateProfile } from "@/features/services/userService";
import { FiCheckCircle } from "react-icons/fi";

export default function EditProfileModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [profileError, setProfileError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validateProfile = () => {
    if (!form.name.trim()) {
      return "O nome não pode ser vazio.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Digite um e-mail válido.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateProfile();
    if (error) return setProfileError(error);

    try {
      await updateProfile(form);
      setSuccess(true)
      onUpdated();
    } catch (err) {
      setProfileError("Erro ao atualizar perfil");
      throw new Error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-surfaceAlt border border-border rounded-lg p-6 w-full max-w-md text-textPrimary shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Editar Perfil</h2>

        {profileError && (
          <div
            className={`text-center font-semibold tracking-wider p-2 rounded mb-3 text-sm ${
              profileError.type === "success"
                ? "bg-green-800 text-green-200"
                : "bg-red-900 text-red-200"
            }`}
          >
            {profileError}
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
               Perfil alterado com sucesso!
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
            <input
              className="w-full p-2 rounded bg-surface text-textPrimary border border-border outline-none"
              placeholder="Nome completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="w-full p-2 rounded bg-surface text-textPrimary border border-border outline-none"
              placeholder="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

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
                className="px-4 py-2 rounded bg-btnPrimary hover:bg-btnPrimaryHover text-white transition"
              >
                Salvar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
