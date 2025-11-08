import { Button } from "@mui/material";
import AdminDashboard from "pages/AdminDashboard";
import { Link } from "react-router-dom";

export default function AdminBatchManagement() {
    return <section className="min-h-[70svh] container">
        <div className="flex justify-between items-center gap-3">
            <h2 className="lg:text-3xl md:text-3xl font-bold text-secondary-500 sm:text-xl">Manage Batches Dashboard</h2>
            <div className=" flex gap-3">
                <Link to="../students"><Button disableElevation={true} className="!normal-case !bg-primary-500" variant="contained">Manage Students</Button></Link>
                <Link to="../content"><Button disableElevation={true} className="!normal-case !bg-primary-500" variant="contained">Manage Content</Button></Link>
            </div>

        </div>
        <div className="mt-3">
            <AdminDashboard />
        </div>

    </section>
}