import { ArrowBack } from "@mui/icons-material";
import { Link } from "react-router-dom";

function ResumeBuider() {
    return <>
        <Link className="flex items-center text-blue-700 hover:underline transition mx-3 my-3"
            to="/account/profile"><ArrowBack /> Back to  Profile</Link>
        <iframe src="https://cj-resume-builder-jet.vercel.app/" title="Resume Builder" className="container mt-5" height={window.innerHeight} width={window.innerWidth}>
        </iframe>
    </>

}

export default ResumeBuider;