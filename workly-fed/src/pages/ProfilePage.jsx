import { useEffect, useState } from "react";
import { getUserDetails } from "@/features/services/userService";
import Loader from "@/components/Loader";
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
    } catch {
      console.error("Erro ao carregar o usuário");
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (!user) return <Loader />;

  return (
    <div className="flex justify-center mt-12 px-6">
      <div className="w-full max-w-xl bg-surface p-8 rounded-xl border border-border shadow-lg backdrop-blur-sm">

        <h1 className="text-2xl font-bold text-textPrimary mb-6">Perfil</h1>

        <div className="text-textSecondary space-y-2">
          <p><span className="font-semibold text-textPrimary">Nome:</span> {user.name}</p>
          <p><span className="font-semibold text-textPrimary">Email:</span> {user.email}</p>
          {/* <p><span className="font-semibold text-textPrimary">Perfil:</span> {user.role}</p> */}
        </div>

        <div className="flex flex-wrap gap-4 mt-8">
          {/* Botão Principal */}
          <button
            onClick={() => setShowEditModal(true)}
            className="
              px-5 py-2 rounded-lg font-semibold shadow-sm bg-primary
              bg-accent text-gray-900 hover:bg-primary-hover
              transition-all duration-200
            "
          >
            Editar Dados
          </button>

          {/* Botão Secundário Outline */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="
               px-5 py-2 rounded-lg font-semibold shadow-sm bg-primary
              bg-accent text-gray-900 hover:bg-primary-hover
              transition-all duration-200 
            "
          >
            Alterar Senha
          </button>
        </div>

        {showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} user={user} onUpdated={loadUser} />}
        {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}

      </div>
    </div>
  );
}

