
import { ApiConstants } from "_utils/api-constants";
import { ProfileDataInterface } from "_utils/interface";
import { useAuth } from "hooks/AuthProvider";
import useWebSocket from 'hooks/websocket';
import { useEffect, useState } from "react";
function IdleTimerComponent() {
    const userAuth = useAuth();
    const isLoggedIn = !!userAuth.token;
    const [userData, setUserData] = useState<ProfileDataInterface>(JSON.parse(localStorage?.getItem("profileData") as any))

    // const ws = useWebSocket(`wss://${ApiConstants.baseSocketUrl}/realtime/?id=${userData?.user_id as string}`, isLoggedIn);


    return <div></div>;
}


export default IdleTimerComponent;
