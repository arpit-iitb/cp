import {TextField} from "@mui/material";
import React from "react";
import axiosHttp from "../../_utils/axios.index";
import {ApiConstants} from "../../_utils/api-constants";
import {RegisterUserRequest} from "../../_utils/interface";

export default function RegisterForm() {
    const [formData, setFormData] = React.useState<RegisterUserRequest>({
        username: "",
        email: "",
        password: "",
        confirm_password: ""
    });
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        axiosHttp.post(ApiConstants.accounts.register, formData).then((res) => {
            alert("registered successfully");
        })
    }
    // eslint-disable-next-line
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }
    return <>
        <form className="w-[400px] mt-3 mb-5" onSubmit={(e) => handleSubmit(e)}>
            <div className="mb-5">
                <TextField value={formData.username} onChange={handleChange}
                           name="username"
                           className="w-full" label="Username" placeholder="Set Username here"
                           type="text"></TextField>
            </div>
            <div className="mb-5">
                <TextField value={formData.email} onChange={handleChange}
                           name="email"
                           className="w-full" label="Email" placeholder="Enter Email here"
                           type="email"></TextField>
            </div>
            <div className="mb-5">
                <TextField value={formData.password} onChange={handleChange}
                           name="password"
                           className="w-full" label="Set Password" placeholder="Enter Password here"
                           type="password"></TextField>
            </div>
            <div className="mb-5">
                <TextField value={formData.confirm_password} onChange={handleChange}
                           name="confirm_password"
                           className="w-full" label="Confirm Password" placeholder="Confirm Password here"
                           type="password"></TextField>
            </div>
            <div className="mb-3">
                <button
                    className="w-full px-6 py-4 bg-blue-500 rounded text-white hover:shadow-lg transition">Register
                </button>
            </div>
        </form>
    </>
}