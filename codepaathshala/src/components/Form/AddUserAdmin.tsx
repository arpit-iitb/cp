import React, {useState} from "react";
import {AddUserFormAdmin, AddUserRequestBody} from "../../_utils/interface";
import axiosHttp from "../../_utils/axios.index";
import {ApiConstants} from "../../_utils/api-constants";
import {Button, Checkbox, FormControlLabel, TextField} from "@mui/material";
import {Bounce, toast, ToastContainer} from "react-toastify";
import MultiSelect from "components/MultiSelect";
import {EMAIL_REGEX, NUMERIC_REGEX} from "../../_utils/constants";
import {AxiosError} from "axios";

export default function AddUserAdminForm({batchList}: {batchList: {label: string, value:string}[]}) {
    const [formData, setFormData] = useState<AddUserFormAdmin>({
        name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
        batch_name: [""],
        send_mail: false
    });

    const [disabled, setDisabled] = React.useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        setDisabled(true);
        event.preventDefault();
        if(formData.confirm_password !== formData.password) {
            toast.error("Passwords don't match");
            setFormData({...formData, confirm_password: ""});
            setDisabled(false);
            return;
        }
        if(formData.password.length < 8) {
            toast.error("Password must be at least 8 characters!");
            setFormData({...formData, confirm_password: "", password: ""});
            setDisabled(false);
            return;
        }
        if(formData.batch_name.length === 0 || (formData.batch_name.length === 1 && formData.batch_name[0] === "")) {
            toast.error("Please Select at least 1 batch");
            setDisabled(false);
            return;
        }
        if(!formData.phone || !NUMERIC_REGEX.test(formData.phone) || formData.phone.length !== 10) {
            toast.error("Please enter a valid phone number");
            setDisabled(false);
            return;
        }
        if(!formData.email || !EMAIL_REGEX.test(formData.email)) {
            toast.error("Please enter a valid email");
            setDisabled(false);
            return;
        }
        let data: AddUserRequestBody = {
            registration_data: {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirm_password: formData.confirm_password,
                phone: formData.phone,
            },
            batch_name: [...formData.batch_name],
            program: "",
            send_email: formData.send_mail,
        };
        axiosHttp.post(ApiConstants.admin.addUser(), data).then(() => {
            toast.success("User Added Successfully!", {
                position: "top-center",
                closeOnClick: true,
                pauseOnHover: true,
                transition: Bounce,
            });
            setDisabled(false);
        })
            .catch((err:AxiosError) => {
                if(err.response?.data) {
                    let message = "";
                    let errorResponse = err.response?.data as {"message":string,"errors":{[key:string]:{[key:string]:string}}};
                    if(errorResponse.errors?.["username"]?.["error"]) {
                        message = "Username already Exists. If you want to edit student, please search the select the batch name and Edit the student Details."
                    }
                    else if(errorResponse?.errors?.["email"]?.["error"]) {
                        message = "Email-Id already Exists. If you want to edit student, please search the select the batch name and Edit the student Details."
                    }
                    toast.error(message, {
                        position: "top-center",
                        closeOnClick: true,
                        pauseOnHover: true,
                        transition: Bounce,
                    });
                }

                setDisabled(false);
            })
    }
    // eslint-disable-next-line
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    const handleSelectChange = (event: { label: string, value: string }[]) => {
        let batches:string[] = [];
        event.forEach((e) => {
            batches.push(`${e.value}`);
        });
        setFormData({ ...formData, batch_name: [...batches] });
    }

    const handleCheckboxChange = () => {
        setFormData({...formData, send_mail: !formData.send_mail});
    };

    return<>
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <TextField value={formData.username} onChange={handleChange}
                               name="username" required={true}
                               className="w-full" label="Username" placeholder="Set Username here"
                               type="text"></TextField>
                </div>
                <div>
                    <TextField value={formData.name} onChange={handleChange}
                               name="name" required={true}
                               className="w-full" label="Name" placeholder="Set Name here"
                               type="text"></TextField>
                </div>
                <div>
                    <TextField value={formData.email} onChange={handleChange}
                               name="email" required={true}
                               className="w-full" label="Email" placeholder="Set Email here"
                               type="email"></TextField>
                </div>
                <div>
                    <TextField value={formData.phone} onChange={handleChange}
                               name="phone" required={true}
                               className="w-full" label="Phone" placeholder="Phone Number"
                               type="text"></TextField>
                </div>
                <div>
                    <TextField value={formData.password} onChange={handleChange}
                               name="password" required={true}
                               className="w-full" label="Password" placeholder="Set Password here"
                               type="text"></TextField>
                </div>
                <div>
                    <TextField value={formData.confirm_password} onChange={handleChange}
                               name="confirm_password" required={true}
                               className="w-full" label="Confirm Password" placeholder="Re-type Password here"
                               type="text"></TextField>
                </div>
                <div>
                    <FormControlLabel control={<Checkbox
                        checked={formData.send_mail}
                        name="send_mail"
                        onChange={handleCheckboxChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />} label={"Notify Student By Email"}/>

                </div>
                <div className="col-span-2">
                    <MultiSelect multiple={true} options={batchList} placeholder={'Choose Batch Name'}
                                 label={'Select Batch'} handleChange={handleSelectChange}/>
                </div>
                <div className="col-span-2">
                    <Button disabled={disabled} variant="contained" className="w-full" type="submit">Add Student</Button>
                </div>
            </div>
        </form>
        <ToastContainer />
    </>
}