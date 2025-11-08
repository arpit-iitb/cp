import { useAuth } from "hooks/AuthProvider";

export default function PageNotFound() {
    const authContext = useAuth();
    authContext.updateClientLogo("");
    return <>

        <div className=" min-h-[60svh]">
            <div className="container">
                <div className="text-center">
                    <h1 className="text-3xl">😮</h1>
                    <h2 className="text-3xl">Oops! Page Not Found</h2>
                    <p className="mb-4">Sorry but the page you are looking for might have been moved.</p>
                    <a href="/" className="mt-6 bg-primary-500 text-white p-2 rounded">Back to homepage</a>
                </div>
            </div>
        </div>
    </>
}