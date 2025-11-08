import { useContext, createContext, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginRequest, ProfileDataInterface } from "../_utils/interface";
import axiosHttp from "../_utils/axios.index";
import { ApiConstants } from "../_utils/api-constants";
import { Logo } from "_utils/enum";

const AuthContext = createContext({
  token: "",
  user: {} as ProfileDataInterface,
  clientLogo: "",
  showHeader: true,
} as any);

const AuthProvider = ({ children }: { children: any }) => {
  const [token, setToken] = useState(localStorage.getItem("accessToken") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("accessToken") !== null ? true : false
  );
  const [user, setUser] = useState<ProfileDataInterface>();
  const [clientLogo, setClientLogo] = useState("");
  const [clientUid, setClientUid] = useState("");
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    if (window.location.hostname === "lms.capabl.in") {
      document.title = "Capabl";
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = "https://lms.capabl.in/favicon_capabl.ico";
      document.head.appendChild(link);
    }
    if (window.location.hostname === "lms.eventbeep.com") {
      document.title = "Event Beep";
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = "https://lms.eventbeep.com/favicon_beep.ico";
      document.head.appendChild(link);
    }
  }, []);
  const loginAction = (formData: LoginRequest) => {
    return axiosHttp.post(ApiConstants.accounts.login, formData);
  };

  const logOut = () => {
    setToken("");
    setUser({} as ProfileDataInterface);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("profileData");
    navigate("/login");
  };

  const getUserInfo = () => {
    let userData = localStorage.getItem("profileData");
    if (userData) {
      setUser(JSON.parse(userData));
      return JSON.parse(userData);
    } else return user as ProfileDataInterface;
  };

  const updateUserInfo = (data: ProfileDataInterface) => {
    let userData = getUserInfo();
    if (userData) data = Object.assign(userData, data);
    setUser(data);
    return user;
  };

  const updateClientLogo = (logo: string) => {
    setClientLogo(logo);
  };
  const getClientUid = () => {
    let uids = localStorage.getItem("uid");
    if (uids) {
      setClientUid(uids);
      return uids;
    } else return clientUid;
  };
  const updateTitle = (title: string) => {
    setTitle(title);
  };

  const contextValue = useMemo(
    () => ({
      token,
      user,
      clientLogo,
      clientUid,
      showHeader,
      isLoggedIn,
      title,
      setToken,
      setIsLoggedIn,
      setUser,
      setShowHeader,
      updateClientLogo,
      loginAction,
      logOut,
      getUserInfo,
      updateUserInfo,
      updateTitle,
      getClientUid,
    }),
    [
      token,
      user,
      clientLogo,
      clientUid,
      title,
      isLoggedIn,
      setToken,
      setUser,
      setIsLoggedIn,
      updateClientLogo,
      loginAction,
      logOut,
      getUserInfo,
      updateUserInfo,
      updateTitle,
      getClientUid,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
