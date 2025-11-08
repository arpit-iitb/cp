import {ChangePasswordInterface, User} from "../../_utils/interface";
import {TextField} from "@mui/material";
import React, {useState} from "react";
import axiosHttp from "../../_utils/axios.index";
import {ApiConstants} from "../../_utils/api-constants";
import {AxiosResponse} from "axios";
import {useNavigate} from "react-router-dom";
import {toast, ToastContainer} from "react-toastify";

export default function ChangePasswordForm({edit, user}: { edit?: boolean, user?:Partial<User> }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ChangePasswordInterface>(
        edit ? {
            new_password: "",
            confirm_new_password: ""
        } : {
            old_password: "",
            new_password: "",
            confirm_new_password: ""
        }
    );
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [event.target.name]: event.target.value});
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(formData.new_password !== formData.confirm_new_password) {
            toast.error("Passwords do not match");
            return;
        }
        if(formData.new_password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        console.log(edit, user);
        if(edit && user?.username) {
            axiosHttp.post(ApiConstants.admin.changePassword(user?.username), {
                password: formData.new_password,
                confirm_password: formData.confirm_new_password,
            }).then((res: AxiosResponse) => {
                toast.success("Successfully updated", {
                    position: "top-right"
                });
            })
                .catch((err: Error) => {
                    toast.error(err.message);
                })
        }
        else {
            axiosHttp.post(ApiConstants.accounts.changePassword, formData)
                .then((res: AxiosResponse) => {
                    navigate('/account/profile');
                })
                .catch((err) => {
                    throw new Error(err);
                })
        }

    }
    return <>
        <form onSubmit={(e) => handleSubmit(e)}>
            {!edit ? <div className="mb-3">
                <TextField value={formData.old_password} onChange={handleChange} className="w-full mb-3"
                           label="Current Password"
                           placeholder="Enter Current Password here"
                           required={true}
                           name="old_password"
                           type="password"></TextField>
            </div> : null}

            <div className="mb-3">
                <TextField value={formData.new_password} onChange={handleChange} className="w-full mb-3"
                           label="New Password"
                           placeholder="Enter New Password here"
                           required={true}
                           name="new_password"
                           type="password"></TextField>
            </div>
            <div className="mb-3">
                <TextField value={formData.confirm_new_password} onChange={handleChange} className="w-full mb-3"
                           label="Confirm New Password"
                           placeholder="Confirm New Password here"
                           required={true}
                           name="confirm_new_password"
                           type="password"></TextField>
            </div>
            <div>
                <button
                    type="submit"
                    className="py-3 bg-blue-500 hover:bg-blue-700 hover:shadow transition text-white w-full rounded-md">Change
                    Password
                </button>
            </div>
        </form>
        <ToastContainer/>
    </>
}