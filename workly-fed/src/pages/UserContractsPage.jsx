import { useState, useEffect } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import useContracts from "../hooks/useContracts";
import api from "../lib/api";
import SkillBadge from "@/components/SkillBadge";
import { formatBudget, formatDate } from "@/common/utils/UtilsGlobal";

export default function UserContractsPage() {
  const { contracts: hookContracts, loading, error } = useContracts();
  const [contracts, setContracts] = useState([]); // estado local principal
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [filter, setFilter] = useState("ACTIVE");
  const [pendingChanges, setPendingChanges] = useState({});
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    setContracts(hookContracts);
  }, [hookContracts]);

  useEffect(() => {
    if (contracts.length != 0) {
      const filtered = contracts.filter(
        (c) => c.status.toUpperCase() === filter.toUpperCase()
      );
      setFilteredContracts(filtered);
    }
    
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

      setContracts((prev) =>
        prev.map((c) =>
          c.link_hash === linkHash ? { ...c, status: newStatus } : c
        )
      );

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
                const selectedStatus = pendingChanges[contract.link_hash] || contract.status;

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
                      <SkillBadge skills={contract.skills} />
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
