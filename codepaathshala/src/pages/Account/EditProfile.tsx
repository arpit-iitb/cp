import { TextField } from "@mui/material";
import SEO from "components/SEO";
import { useEffect, useState } from "react";
import axiosHttp from "../../_utils/axios.index";
import { AxiosResponse } from "axios";
import { ApiConstants } from "_utils/api-constants";
import { useAuth } from "hooks/AuthProvider";
import { Link } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
export default function EditProfile() {
    const [formData, setFormData] = useState<any>({
        name: '',
        email: '',
        mobile: '',
        github_url: '',
        linkedin_url: ''
    });
    const authContext = useAuth();
    const [showResult, setShowResult] = useState<any>('')
    useEffect(() => {
        authContext.updateClientLogo("");
        axiosHttp.get(ApiConstants.accounts.profileDetails)
            .then((res: AxiosResponse) => {
                setShowResult('')
                let dataObj = {
                    name: res.data.user.name,
                    email: res.data.user.email,
                    mobile: res.data.user.phone_number,
                    github_url: res.data.github_url,
                    linkedin_url: res.data.linkedin_url

                }
                setFormData(dataObj);
            })
        // eslint-disable-next-line
    }, []);
    const handleReportChange = (event: any) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleReportSubmit = (event: any) => {
        event.preventDefault();
        let formDataObj = {
            github_url: formData.github_url,
            linkedin_url: formData.linkedin_url
        }
        axiosHttp.patch(ApiConstants.accounts.profileDetails, formDataObj)
            .then((res: AxiosResponse) => {
                setShowResult('Profile Updated Successfully!')
                let dataObj = {
                    name: res.data.user.name,
                    email: res.data.user.email,
                    mobile: res.data.user.phone_number,
                    github_url: res.data.github_url,
                    linkedin_url: res.data.linkedin_url

                }
                setFormData(dataObj);
            })
    };
    return (
        <>
            <SEO title={'Edit Profile | CodePaathshala'} description={'CodePaathshala Profile'} />
            <Link className="flex items-center text-blue-700 hover:underline transition mx-3 my-3"
                to="/account/profile"><ArrowBack /> Back to  Profile</Link>
            <p className="text-2xl ml-3 mb-3">Edit Your Profile</p>
            <div className="flex flex-wrap">
                {/* First Form */}
                <div className="w-full md:w-1/2 px-4 mb-4">
                    <TextField
                        fullWidth
                        id="inputEmail"
                        name="name"
                        label="Name"
                        size="small"
                        variant="outlined"
                        value={formData.name}
                        disabled={true}
                        onChange={handleReportChange}
                    />
                </div>

                <div className="w-full md:w-1/2 px-4 mb-4">
                    <TextField
                        fullWidth
                        id="inputUsername"
                        name="email"
                        size="small"
                        label="Email"
                        variant="outlined"
                        disabled={true}
                        value={formData.email}
                        onChange={handleReportChange}
                    />
                </div>

                {/* Second Form */}
                <div className="w-full md:w-1/2 px-4 mb-4">
                    <TextField
                        fullWidth
                        id="inputIssueDescription"
                        name="mobile"
                        label="Mobile"
                        variant="outlined"
                        disabled={true}
                        size="small"
                        placeholder="Enter your mobile"
                        value={formData.mobile}
                        onChange={handleReportChange}
                    />
                </div>

                <div className="w-full md:w-1/2 px-4 mb-4">
                    <TextField
                        fullWidth
                        id="UserCode"
                        name="github_url"
                        label="Github URL"
                        variant="outlined"
                        size="small"
                        placeholder="Enter your Github url."
                        value={formData.github_url}
                        onChange={handleReportChange}
                    />
                </div>

                {/* Third Form */}
                <div className="w-full md:w-1/2 px-4 mb-4">
                    <TextField
                        fullWidth
                        id="contact_number"
                        name="linkedin_url"
                        label="Linkedin Url"
                        variant="outlined"
                        size="small"
                        placeholder="Enter your Linkedin  Url"
                        value={formData.linkedin_url}
                        onChange={handleReportChange}
                    />
                </div>
                <div className="w-full md:w-1/2 px-5  mb-4 flex items-end justify-end">
                    <button type="submit" onClick={handleReportSubmit} className="bg-primary-500 hover:bg-primary-400 text-white py-2 px-4 rounded cursor-pointer">
                        Submit
                    </button>
                </div>

            </div>
            {showResult && (<div className="text-green-800 flex justify-center">{showResult}</div>)}
        </>
    );
}
