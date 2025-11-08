import Lottie from "lottie-react";
import Loader from "assets/json/loader.json"
export default function Loading() {
    return <div className="flex justify-center items-center min-h-[60svh]">
        <div className="flex flex-col justify-center items-center">
            <Lottie animationData={Loader} className="w-64" />
            <h2 className="text-secondary-500 text-xl">Compiling Your Personalized Experience...</h2>
        </div>

    </div>
}