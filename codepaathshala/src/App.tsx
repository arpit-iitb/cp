import './App.css';
import { useRoutes } from "react-router-dom";
import routes from "routes";
import Navbar from "components/Navbar";
import Footer from "components/Footer";
import AuthProvider from "./hooks/AuthProvider";
import { Provider as ReactReduxProvider } from 'react-redux';
import { store } from "./state";

function App() {

    const routeResult = useRoutes(routes);
    return (
        <>
            <div className="min-h-screen flex flex-col">
                <ReactReduxProvider store={store}>
                    <AuthProvider>
                        <Navbar />
                        <div className="flex-1">{routeResult}</div>
                        <Footer />
                    </AuthProvider>
                </ReactReduxProvider>
            </div>

        </>
    );
}

export default App;
