import { useEffect,useState } from "react";
import { addUserContract, getUserContracts, updateUserContractStatus } from "../features/contracts/contractService";

export default function useContracts(){
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const data = await getUserContracts();
            setContracts(data);
        } catch(error) {
            setError(error.response?.data?.message || "Erro ao carregar contratos");
        } finally {
            setLoading(false);
        }
    };

    const addContract = async (linkHash) => {
        try {
            await addUserContract(linkHash);
            await fetchContracts();
        } catch (error) {
            setError(error.response?.data?.message || "Erro ao adicionar contrato");
        }
    };

    const updateStatus = async (linkHash, status) => {
        try {
            await updateUserContractStatus(linkHash, status);
            await fetchContracts();
        } catch (error) {
            setError(error.response?.data?.message || "Erro ao atualizar status do contrato");
        }
    };

    useEffect(() => {
        fetchContracts();
    }, [])

    return { contracts, loading, error, fetchContracts, addContract, updateStatus };
};
