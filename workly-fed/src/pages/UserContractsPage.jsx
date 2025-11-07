import { useState, useEffect } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import useContracts from "../hooks/useContracts";
import api from "../lib/api";

export default function UserContractsPage() {
  const { contracts: hookContracts, loading, error } = useContracts();
  const [contracts, setContracts] = useState([]); // estado local principal
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [filter, setFilter] = useState("ACTIVE");
  const [pendingChanges, setPendingChanges] = useState({});
  const [updating, setUpdating] = useState(null);

  const badgeColors = [
    "bg-blue-200 text-blue-800",
    "bg-green-200 text-green-800",
    "bg-yellow-200 text-yellow-800",
    "bg-purple-200 text-purple-800",
    "bg-pink-200 text-pink-800",
    "bg-red-200 text-red-800",
    "bg-indigo-200 text-indigo-800",
    "bg-teal-200 text-teal-800",
    "bg-orange-200 text-orange-800",
  ];

  // Atualiza contratos locais quando hookContracts mudar
  useEffect(() => {
    setContracts(hookContracts);
  }, [hookContracts]);

  // Atualiza a lista filtrada quando contratos ou filtro mudarem
  useEffect(() => {
    const filtered = contracts.filter(
      (c) => c.status.toUpperCase() === filter.toUpperCase()
    );
    setFilteredContracts(filtered);
  }, [contracts, filter]);

  const handleStatusSelect = (linkHash, newStatus) => {
    setPendingChanges((prev) => ({
      ...prev,
      [linkHash]: newStatus,
    }));
  };

  const handleConfirmUpdate = async (linkHash) => {
    const newStatus = pendingChanges[linkHash];
    if (!newStatus) return;

    try {
      setUpdating(linkHash);
      await api.patch("/api/users/contracts", { linkHash, newStatus });

      // ✅ Atualiza o contrato no estado principal
      setContracts((prev) =>
        prev.map((c) =>
          c.link_hash === linkHash ? { ...c, status: newStatus } : c
        )
      );

      // Remove o pending change
      setPendingChanges((prev) => {
        const copy = { ...prev };
        delete copy[linkHash];
        return copy;
      });
    } catch (err) {
      console.error("Erro ao atualizar contrato:", err);
      alert("Erro ao salvar o status. Tente novamente.");
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatBudget = (value) => {
    if (value == null) return "";
    const rounded = Math.round(value);
    return rounded.toLocaleString("pt-BR");
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-white">Meus Contratos</h1>

        {/* Filtro */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 bg-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-white"
        >
          <option value="PENDING">Pendentes</option>
          <option value="ACTIVE">Ativos</option>
          <option value="COMPLETED">Concluídos</option>
          <option value="CANCELED">Cancelados</option>
        </select>
      </div>

      {/* Mensagens */}
      {loading && (
        <p className="text-center text-gray-500 mt-10">
          Carregando contratos...
        </p>
      )}
      {error && (
        <p className="text-center text-red-500 mt-10">
          {error || "Erro ao carregar contratos."}
        </p>
      )}

      {/* Lista */}
      {!loading && !error && (
        <>
          {filteredContracts.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">
              Nenhum contrato encontrado.
            </p>
          ) : (
            <div className="grid gap-4">
              {filteredContracts.map((contract) => {
                const selectedStatus =
                  pendingChanges[contract.link_hash] || contract.status;
                const skills = contract.skills
                  ? contract.skills.split(" | ")
                  : [];

                return (
                  <div
                    key={contract.link_hash}
                    className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-3 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {contract.title}
                        <a
                          href={contract.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaExternalLinkAlt className="inline-block ml-2 w-3" />
                        </a>
                      </h2>

                      <p className="text-sm text-gray-600 mt-1">
                        Linguagens:{" "}
                        <span className="font-medium text-gray-800">
                          {skills.map((skill, index) =>
                            skill === "+" ? null : (
                              <span
                                key={index}
                                className={`rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${
                                  badgeColors[index % badgeColors.length]
                                }`}
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </span>
                      </p>

                      <p className="text-sm text-gray-600">
                        Orçamento:{" "}
                        <span className="font-medium text-gray-800">
                          R$ {formatBudget(contract.min_budget)} ~{" "}
                          {formatBudget(contract.max_budget)}
                        </span>
                      </p>

                      <p className="text-sm text-gray-600">
                        Data de inclusão:{" "}
                        <span className="font-medium text-gray-800">
                          {formatDate(contract.scraped_at)}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 items-start">
                      <select
                        disabled={updating === contract.link_hash}
                        value={selectedStatus}
                        onChange={(e) =>
                          handleStatusSelect(contract.link_hash, e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-2 py-1 bg-surface text-sm focus:ring-2 focus:ring-surface"
                      >
                        <option value="PENDING">Pendente</option>
                        <option value="ACTIVE">Ativo</option>
                        <option value="COMPLETED">Concluído</option>
                        <option value="CANCELED">Cancelado</option>
                      </select>

                      {pendingChanges[contract.link_hash] &&
                        pendingChanges[contract.link_hash] !==
                          contract.status && (
                          <button
                            onClick={() =>
                              handleConfirmUpdate(contract.link_hash)
                            }
                            disabled={updating === contract.link_hash}
                            className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition disabled:opacity-50"
                          >
                            {updating === contract.link_hash
                              ? "Salvando..."
                              : "Salvar"}
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
