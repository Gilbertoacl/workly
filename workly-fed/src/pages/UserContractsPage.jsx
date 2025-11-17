import { useState, useEffect } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import useContracts from "../hooks/useContracts";
import api from "../lib/api";
import SkillBadge from "@/components/SkillBadge";
import { formatBudget, formatDate } from "@/common/utils/UtilsGlobal";

export default function UserContractsPage() {
  const { contracts: hookContracts, loading, error } = useContracts();
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [filter, setFilter] = useState("PENDING");
  const [pendingChanges, setPendingChanges] = useState({});
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    setContracts(hookContracts);
  }, [hookContracts]);

  useEffect(() => {
    if (contracts.length !== 0) {
      setFilteredContracts(
        contracts.filter((c) => c.status.toUpperCase() === filter.toUpperCase())
      );
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
        const updated = { ...prev };
        delete updated[linkHash];
        return updated;
      });
    } catch (err) {
      alert("Erro ao salvar o status. Tente novamente.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
          Meus Contratos
        </h1>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-700 bg-gray-900 text-gray-200 px-3 py-2 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
        >
          <option value="PENDING">Pendentes</option>
          <option value="ACTIVE">Ativos</option>
          <option value="COMPLETED">Concluídos</option>
          <option value="CANCELLED">Cancelados</option>
        </select>
      </div>

      {/* Feedback de loading / error */}
      {loading && (
        <p className="text-center text-gray-400 mt-10 text-sm">
          Carregando contratos...
        </p>
      )}

      {error && (
        <p className="text-center text-red-500 mt-10 text-sm">
          {error || "Erro ao carregar contratos."}
        </p>
      )}

      {/* Listagem */}
      {!loading && !error && (
        <>
          {filteredContracts.length === 0 ? (
            <p className="text-center text-gray-500 mt-10 text-sm">
              Nenhum contrato encontrado.
            </p>
          ) : (
            <div className="grid gap-4">
              {filteredContracts.map((contract) => {
                const selectedStatus =
                  pendingChanges[contract.link_hash] || contract.status;

                return (
                  <div
                    key={contract.link_hash}
                    className="p-6 bg-[#14191C] border border-gray-800 rounded-xl shadow-md backdrop-blur-sm transition-all hover:border-accent/40 hover:-translate-y-[1px]"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      {/* Dados do contrato */}
                      <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-gray-100 tracking-tight">
                          {contract.title}
                          <a
                            href={contract.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaExternalLinkAlt className="inline-block ml-2 w-3 opacity-70 hover:opacity-100 transition" />
                          </a>
                        </h2>

                        <SkillBadge skills={contract.skills} />

                        <p className="text-sm text-gray-400">
                          Orçamento:{" "}
                          <span className="font-medium text-gray-200">
                            R$ {formatBudget(contract.min_budget)} ~{" "}
                            {formatBudget(contract.max_budget)}
                          </span>
                        </p>

                        <p className="text-sm text-gray-400">
                          Data de inclusão:{" "}
                          <span className="font-medium text-gray-200">
                            {formatDate(contract.scraped_at)}
                          </span>
                        </p>
                      </div>

                      {/* Seleção de status */}
                      <div className="flex flex-col gap-2 items-start">
                        <select
                          disabled={updating === contract.link_hash}
                          value={selectedStatus}
                          onChange={(e) =>
                            handleStatusSelect(
                              contract.link_hash,
                              e.target.value
                            )
                          }
                          className="border border-gray-700 bg-[#14191C] text-gray-200 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-accent transition-all"
                        >
                          <option value="PENDING">Pendente</option>
                          <option value="ACTIVE">Ativo</option>
                          <option value="COMPLETED">Concluído</option>
                          <option value="CANCELLED">Cancelado</option>
                        </select>

                        {pendingChanges[contract.link_hash] &&
                          pendingChanges[contract.link_hash] !==
                            contract.status && (
                            <button
                              onClick={() => handleConfirmUpdate(contract.link_hash)}
                              disabled={updating === contract.link_hash}
                              className={`w-full px-4 py-2 bg-primary rounded-lg text-sm font-semibold border border-accent text-accent hover:bg-accent hover:text-gray-900
                                        shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                              {updating === contract.link_hash
                                ? "Salvando..."
                                : "Salvar "}
                            </button>
                          )}
                      </div>
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
