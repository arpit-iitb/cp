import React, { useEffect, useState } from "react";
import axiosHttp from "../../_utils/axios.index";
import { Button, TextField } from "@mui/material";
import { User } from "../../_utils/interface";
import { ApiConstants } from "../../_utils/api-constants";
import MultiSelect from "components/MultiSelect";
import { toast } from "react-toastify";
import { AxiosResponse } from "axios";

export default function EditProfileForm({ user, type, batchList }: { user: Partial<User>, type?: "Register" | "Edit", batchList: { label: string, value: string }[] },) {
    const [formData, setFormData] = useState<Partial<User>>({
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        batch: user.batch,
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (type === "Edit") {
            if (!formData?.username) {
                toast.error("Please enter a valid username");
                return;
            }
            if (!formData?.batch || formData?.batch?.length === 0 || (formData.batch.length === 1 && formData.batch[0] === "")) {
                toast.error("Please Select at least 1 batch");
                return;
            }

            axiosHttp.patch(ApiConstants.admin.updateUser(formData?.username ?? "", formData.batch), {
                name: formData.name,
                phone_number: formData.phone_number,
                email: formData.email,
            }).then((res: AxiosResponse) => {
                toast.success("Successfully updated");
            })
                .catch((err: Error) => {
                    toast.error(err.message);
                });
        } else {
            axiosHttp.post(ApiConstants.accounts.register, formData).then((res) => {
                alert("registered successfully");
            });
        }
    }

    const handleSelectedBatch = (event: { label: string, value: string }[]) => {
        const selections: string[] = event.map((e) => e.value);
        setFormData({ ...formData, batch: selections });
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    return (
        <form className="w-full" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <TextField
                        value={formData.username}
                        onChange={handleChange}
                        name="username"
                        disabled
                        className="w-full"
                        label="Username"
                        placeholder="Set Username here"
                        type="text"
                    />
                </div>
                <div>
                    <TextField
                        value={formData.email}
                        onChange={handleChange}
                        name="email"
                        className="w-full"
                        label="Email"
                        placeholder="Set Email here"
                        type="email"
                    />
                </div>
                <div>
                    <TextField
                        value={formData.phone_number}
                        onChange={handleChange}
                        name="phone_number"
                        className="w-full"
                        label="Mobile"
                        placeholder="Set Mobile here"
                        type="text"
                    />
                </div>
                <div>
                    {batchList?.length > 0 && (
                        <MultiSelect
                            value={formData.batch ?? user.batch}
                            options={batchList}
                            placeholder={"Select Batch Names"}
                            label={"Batch Names"}
                            handleChange={handleSelectedBatch}
                            multiple={true}
                        />
                    )}
                </div>
                <div>
                    <Button className="w-full" type="submit" variant="contained">Save</Button>
                </div>
            </div>
        </form>
    );
}
