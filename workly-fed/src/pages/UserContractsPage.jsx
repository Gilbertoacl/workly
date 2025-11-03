import { useContracts } from "../hooks/useContracts";

const UserContractsPage = () => {
  const { contracts, loading, error, updateStatus } = useContracts();

  if (loading) return <p className="text-center text-gray-500">Carregando contratos...</p>;

  if (error) return <p className="text-red-500 text-center">{error}</p>;

  if (contracts.length === 0)
    return (
      <p className="text-center text-gray-500">
        Você ainda não possui contratos.
      </p>
    );

  return (
    <div className="p-4">
        <h1 className="text-xl font-semibold mb-4">Meus Contratos</h1>
        <div className="grid gap-4">
            {contracts.map((contract) => (
                <div
                    key={contract.link_hash}
                    className="p-4 bg-white rounded-xl shadow-md border border-gray-200 flex justify-between items-center"
                > 
                    <div>
                        <p className="font-medium text-gray-800">Contrato: {contract.title}</p>
                        <p className="text-sm text-gray-600">Status: {contract.status}</p>
                    </div>

                    <button 
                        onClick={() => updateStatus(contract.link_hash, 'CANCELED')}
                        className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md"
                    >Fechar Contrato</button>
                </div>
            ))}
        </div>
    </div>
  )

};

export default UserContractsPage;
