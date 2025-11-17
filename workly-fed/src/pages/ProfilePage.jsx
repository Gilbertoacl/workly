import { useEffect, useState } from "react";
import { getUserDetails } from "@/features/services/userService";
import EditProfileModal from "@/components/EditProfileModal";
import ChangePasswordModal from "@/components/ChangePasswordModal";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const loadUser = async () => {
    try {
      const data = await getUserDetails();
      setUser(data);
    } catch (error) {
      console.error("Erro ao carregar o usuário", error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center py-20 text-textSecondary">
        Carregando dados do perfil...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-surfaceAlt p-8 rounded-xl border border-border shadow-lg transition-all">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">
        Perfil do Usuário
      </h1>

      <div className="space-y-3 text-textSecondary">
        <p><span className="font-semibold text-textPrimary">Nome:</span> {user.name}</p>
        <p><span className="font-semibold text-textPrimary">Email:</span> {user.email}</p>
        <p><span className="font-semibold text-textPrimary">Perfil:</span> {user.role}</p>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2 rounded bg-btnPrimary text-white hover:bg-btnPrimaryHover transition"
        >
          Editar informações
        </button>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white transition"
        >
          Alterar senha
        </button>
      </div>

      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} user={user} onUpdated={loadUser} />
      )}

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}