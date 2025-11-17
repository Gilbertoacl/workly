import api from "@/lib/api";

export async function updateProfile(profileData) {
    const res = await api.patch(`/api/user/updateProfile`, profileData);
    return res.data;
}

export async function updatePassword(passwordData) {
    const res = await api.patch(`/api/user/updatePassword`, passwordData);
    return res.data
}

export async function getUserDetails(){
    const res = await api.get(`/api/user/details`);
    return res.data;
}