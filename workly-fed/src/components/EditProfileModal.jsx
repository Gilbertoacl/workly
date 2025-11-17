import { useState } from "react";
import { updateProfile } from "@/features/services/userService";
import { FiCheckCircle } from "react-icons/fi";

export default function EditProfileModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [profileError, setProfileError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validateProfile = () => {
    if (!form.name.trim()) return "O nome não pode ser vazio.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Digite um e-mail válido.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateProfile();
    if (error) return setProfileError(error);

    try {
      await updateProfile(form);
      setSuccess(true);
      onUpdated();
    } catch (err) {
      setProfileError("Erro ao atualizar perfil");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-surfaceAlt border border-border rounded-xl p-6 w-full max-w-md text-textPrimary shadow-xl">

        <h2 className="text-xl font-semibold mb-4">Editar Perfil</h2>

        {profileError && (
          <div className="p-2 rounded text-sm font-semibold bg-red-900 text-red-200 mb-3 text-center">
            {profileError}
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center gap-6 py-6">
            <FiCheckCircle className="text-green-400 text-5xl" />
            <h2 className="text-center text-xl font-bold">Perfil alterado com sucesso!</h2>

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
            <input
              className="
                w-full p-3 rounded-lg bg-surface border border-border text-textPrimary
                focus:border-accent focus:ring-2 focus:ring-accent/40 outline-none transition
              "
              placeholder="Nome completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="
                w-full p-3 rounded-lg bg-surface border border-border text-textPrimary
                focus:border-accent focus:ring-2 focus:ring-accent/40 outline-none transition
              "
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

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
                Salvar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
