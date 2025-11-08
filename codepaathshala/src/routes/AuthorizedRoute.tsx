import React from "react";
import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "hooks/AuthProvider";

export default function AuthorizedRoute({isDashboard}: {isDashboard?: boolean}) {
    const user = useAuth();
    // if((location.pathname?.includes("manage/batch") || location.pathname.includes("manage/content"))) {
    //     return <Navigate to={"/manage/students"}/>
    // }
    if (!user.token) return <Navigate to="/login" />;

    if(isDashboard) {
        if (!user.getUserInfo().user?.is_staff) {
            return <Navigate to="/" />;
        }
    }

    return <Outlet />;
}