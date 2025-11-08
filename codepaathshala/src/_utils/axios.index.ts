import axios from "axios";
import { ApiConstants } from "./api-constants";

const axiosHttp = axios.create({
    baseURL: `${ApiConstants.baseApiUrl}`,
});
const uid = localStorage.getItem("uid")

axiosHttp.interceptors.request.use(
    (config: any) => {
        if (config.url.includes("accounts/login") || config.url.includes("accounts/register")) {
            return config;
        }
        let token = localStorage.getItem("accessToken");
        if (token) {
            config.headers["Authorization"] = token;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosHttp.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response.status === 401 || error.response.status === 403) {
            window.location.href = uid ? `/login/${uid}` : "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosHttp;