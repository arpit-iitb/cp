import SEO from "components/SEO";
import RegisteredBatch from "components/cards/RegisteredBatch";
import { useEffect, useState } from "react";
import axiosHttp from "../../_utils/axios.index";
import { ApiConstants } from "../../_utils/api-constants";
import { AxiosResponse } from "axios";
import { RegisteredBatchInterface } from "../../_utils/interface";
import { useAuth } from "hooks/AuthProvider";
import Lottie from "lottie-react";
import Register from "assets/json/register.json";
import Loader from "assets/json/loader.json"
export default function RegisteredBatches() {
    const userAuth = useAuth();
    const [registeredBatches, setRegisteredBatches] = useState<RegisteredBatchInterface[]>();
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        setLoading(true)
        axiosHttp.get(ApiConstants.accounts.assosiatedBatches).then((res: AxiosResponse) => {
            setRegisteredBatches(res.data);
            setTimeout(() => {
                setLoading(false)
            }, 2000)
        });
        return;
    }, []);

    return (
        <section className="min-h-[80svh]">
            <SEO title="Registered Batches | CodePaathshala" description={"CodePaathshala"} name={"CodePaathshala"} />
            <section className="container mb-24">
                <div className={registeredBatches && registeredBatches?.length > 0 ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` : ''}>
                    {registeredBatches && registeredBatches.length > 0 ? (
                        registeredBatches.map((single: RegisteredBatchInterface, index: number) => (
                            <div key={single.name} className={`${index > 2 ? 'lg:mt-8 flex items-stretch' : 'flex items-stretch'}`}>
                                <RegisteredBatch {...single} />
                            </div>
                        ))
                    ) : (
                        <>
                            {!loading ? (
                                <>
                                    {registeredBatches && registeredBatches.length <= 0 && <div className="flex justify-center items-center min-h-[60svh]">
                                        <div className="flex flex-col justify-center items-center">
                                            <Lottie animationData={Register} className="w-64" />
                                            <div className="text-2xl text-secondary-500 mt-4 text-center">No Registered Batches Found!</div>
                                        </div>
                                    </div>}
                                </>
                            ) : <div className="flex justify-center items-center min-h-[60svh]">
                                <div className="flex flex-col justify-center items-center">
                                    <Lottie animationData={Loader} className="w-64" />
                                    <h2 className="text-secondary-500 text-xl">Compiling Your Personalized Experience...</h2>
                                </div>

                            </div>}
                        </>


                    )}
                </div>
            </section>
        </section>
    );
}
