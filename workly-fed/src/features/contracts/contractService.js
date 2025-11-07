import api from "../../lib/api";

export const getUserContracts = async () => {
    const response = await api.get('/api/users/contracts');
    return response.data;
};

export const addUserContract = async (linkhash) => {
    await api.post('/api/users/contracts', { linkhash });
};

export const updateUserContractStatus = async (linkhash, status) => {
    await api.patch('/api/users/contracts', { linkhash, status });
};