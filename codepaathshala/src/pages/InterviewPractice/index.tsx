import { ApiConstants } from "_utils/api-constants";
import axios, { AxiosResponse } from "axios";
import { useAuth } from "hooks/AuthProvider";
import "./interview.css";
function InterViewPreparation() {
    const userAuth = useAuth();
    function widget() {
        try {
            const token = 'd43f6e0b-9a1c-4f91-b7e3-28a5d9ce2d82';
            const dataObj = {
                user_id: userAuth?.user?.id
            };
            axios.post(ApiConstants.interview.preparation(), dataObj, {
                headers: {
                    'authentication': `${token}`
                }
            }).then((res: AxiosResponse) => {
                // @ts-ignore
                EmbeddableWidget.mount({
                    test: true,
                    email: userAuth?.user?.user?.email,
                    role_key: "data-scientist-FCYNemn7iM2TOJnYTV78Cp",
                    user_id: userAuth?.user?.id, // provided by capabl (Required),
                    auth_token: res?.data?.data?.token, // this will you get from above API (Required)
                    callback: (data: any) => {
                        // console.log('data after closed modal ', data);
                    }
                });
            });
        } catch (error) {
            console.error('Error:', error);
        }

    }
    return <>

        <div>
            <div className="min-h-[70svh]">

                <div className="flex flex-col items-center bg-white rounded-lg shadow-lg p-6">
                    <ul className="text-gray-800">
                        <li>Practice Mock Interview</li>
                    </ul>
                    <button onClick={widget} className="mt-4 bg-primary-500 hover:bg-primary-70 text-white font-bold py-2 px-4 rounded">
                        Start Mock Interview
                    </button>
                </div>

            </div>
        </div>
    </>
}
export default InterViewPreparation;