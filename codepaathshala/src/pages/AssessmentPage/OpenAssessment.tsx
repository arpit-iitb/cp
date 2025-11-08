
import AssessmentPage from "pages/AssessmentPage/index";
import React, { ChangeEvent, useState } from "react";
import { OpenFormRegistration, SnackbarInterface } from "../../_utils/interface";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { Snackbar, TextField } from "@mui/material";
import { SnackBarSeverityLevel } from "../../_utils/enum";
import { Alert } from "@mui/lab";
import { useAuth } from "hooks/AuthProvider";
import { useParams } from "react-router-dom";
import { ApiConstants } from "_utils/api-constants";
import axiosHttp from "_utils/axios.index";
import { AxiosResponse } from "axios";
import { Bounce, toast } from "react-toastify";

export default function OpenAssessmentPage() {
    const context = useAuth();
    const { id } = useParams()
    const [registered, setRegistered] = useState(false);
    const [mobileError, setMobileError] = useState(false);
    const [graduation, setGraduation] = useState(false);
    const [usn, setUsn] = useState(false);
    const [formData, setFormData] = useState<OpenFormRegistration>({
        name: "",
        email: "",
        mobile: "",
        graduation: "",
        usn: "",
        resume_link: "",
        college: ""
    });
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files: any = e?.target?.files;
        const allowedTypes = ['application/pdf'];
        const maxSizeMB = 1;
        if (files) {
            if (!allowedTypes.includes(files[0]?.type)) {
                return;
            } else if (files[0]?.size > maxSizeMB * 1024 * 1024) {
                return;
            } else {
                const formData = new FormData();
                formData.append('file', files[0]);
                axiosHttp.post(ApiConstants.problems.assignmentsOpenFileUpload(), formData)
                    .then((res: AxiosResponse) => {
                        if (res.data.file) {
                            // @ts-ignore
                            setFormData({ ...formData, resume_link: res.data.file });
                            toast.success("Resume uploaded Successfully!", {
                                position: "bottom-center",
                                closeOnClick: true,
                                pauseOnHover: true,
                                transition: Bounce,
                                containerId: "videoUpload",
                                theme: "colored"
                            });


                        }
                    })
                    .catch((error: any) => {
                        toast.error("Failed to  uploaded File Please check once!", {
                            position: "bottom-center",
                            closeOnClick: true,
                            pauseOnHover: true,
                            transition: Bounce,
                            containerId: "videoUpload",
                            theme: "colored"
                        });
                        console.error('File upload error:', error);

                    });
            }
        }
    }
    const [snackbar, setSnackbar] = React.useState<SnackbarInterface>({
        message: "",
        severity: SnackBarSeverityLevel.WARNING,
        vertical: "top",
        horizontal: "center",
        open: false
    });

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackbar({
            ...snackbar,
            open: false
        })
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSnackbar({
            ...snackbar,
            open: true,
            message: "Details saved successfully!",
            severity: SnackBarSeverityLevel.SUCCESS,
        });
        setTimeout(() => {
            setRegistered(true);
        }, 500)
    }

    const handleOnClose = () => {

    }

    return <>
        <Dialog open={!registered} onClose={handleOnClose}>
            <DialogTitle>Personal Details</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {context.clientLogo && <img src={context.clientLogo} alt="brand_logo" width={150} className="mx-auto" />}
                    <p className="text-xl font-bold flex justify-center">{context.title}
                    </p>

                    Please fill in below details to help us know you better
                </DialogContentText>
                <form className="mt-4" onSubmit={(e) => handleSubmit(e)}>
                    <div className="mb-5">
                        <TextField value={formData.name} onChange={handleChange}
                            name="name"
                            required
                            className="w-full" label="Full Name" placeholder="Enter Name here"
                            type="text"></TextField>
                    </div>
                    <div className="mb-5">
                        <TextField value={formData.email} onChange={handleChange}
                            name="email"
                            required
                            className="w-full" label="Email" placeholder="Enter Email here"
                            type="email"></TextField>
                    </div>
                    <div className="mb-5">
                        <TextField value={formData.mobile}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                handleChange(e);
                                if (e.target.value.length > 10 || e.target.value.length < 10) {
                                    return setMobileError(true);
                                }
                                setMobileError(false);
                            }}
                            error={mobileError}
                            name="mobile"
                            required
                            inputProps={{ min: 10, max: 10 }}
                            className="w-full" label="Mobile No." placeholder="Enter Mobile no. here"
                            type="text"></TextField>

                    </div>
                    <div className="mb-5">
                        <TextField value={formData.graduation}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                handleChange(e);
                                if (e.target.value.length > 4 || e.target.value.length < 4) {
                                    return setGraduation(true);
                                }
                                setGraduation(false);
                            }}
                            error={graduation}
                            name="graduation"
                            required
                            inputProps={{ min: 4, max: 4 }}
                            className="w-full" label="Graduation Year" placeholder="Enter Graduation Year Here"
                            type="text"></TextField>
                    </div>
                    {id?.includes("capabl") || window.location.hostname === "lms.capabl.in" ? (
                        <div className="mb-5">
                            <TextField value={formData.college}  onChange={handleChange}
                                name="college"
                                required
                                className="w-full" label="College Name" placeholder="Enter College Name Here"
                                type="text"></TextField>
                        </div>
                    ) : null}
                    {["nmit-programming-assessment-1", "nmit-programming-assessment-2", "nmit-placement-test", "nmit-placement-test-v2"].includes(id as any) ? (
                        <div className="mb-5">
                            <TextField value={formData.usn}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    handleChange(e);
                                }}
                                error={usn}
                                name="usn"
                                required
                                inputProps={{ min: 10, max: 10 }}
                                className="w-full" label="Enter USN" placeholder="Enter USN  here"
                                type="text"></TextField>

                        </div>
                    ) : null}

                    {["fsd-assessment-capabl", "design-assessment-capabl", "ds-assessment-capabl", "ev-assessment-capabl"]?.includes(id as any) ? (
                        <>
                            <p>Upload Resume:</p>
                            <input className="block w-full text-sm text-gray-500 mb-3 mt-3 border border-primary-500 p-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={handleFileChange} accept=".pdf" type="file" required></input>
                            <p className="text-gray-500 text-xs">Please upload files smaller than 1 MB and if you are sending only file no need to click on submit.</p>
                        </>
                    ) : null}

                    <div className="mb-3">
                        <button
                            className="w-full py-4 bg-blue-500 rounded text-white hover:shadow-lg transition">Submit
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
        <AssessmentPage {...formData} />
        <Snackbar anchorOrigin={{ vertical: snackbar.vertical, horizontal: snackbar.horizontal }} open={snackbar.open} autoHideDuration={5000} onClose={handleCloseSnackbar}>
            <Alert
                onClose={handleCloseSnackbar}
                severity={snackbar.severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {snackbar.message}
            </Alert>
        </Snackbar>
    </>
}