import { useContext } from "react";
import { AuthContext } from "../common/context/AuthContext";

const useAuth = () => {
    return useContext(AuthContext);
}

export default useAuth;