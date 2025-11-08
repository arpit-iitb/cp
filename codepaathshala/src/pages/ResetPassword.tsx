import { Card, CardContent, CircularProgress, Snackbar, TextField } from "@mui/material";
import React, { useEffect } from "react";
import SEO from "components/SEO";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosHttp from "../_utils/axios.index";
import { ApiConstants } from "../_utils/api-constants";
import { Alert } from "@mui/lab";
import { PasswordResetRequest, SnackbarInterface } from "../_utils/interface";
import { SnackBarSeverityLevel } from "../_utils/enum";
import { useAuth } from "hooks/AuthProvider";


export default function ResetPassword() {
    const location = useLocation();
    const [formData, setFormData] = React.useState<PasswordResetRequest>({
        email: "",
        otp: "",
        newpass: "",
        newpass_again: ""
    });

    useEffect(() => {
        if (location.state && location.state.email) {
            setFormData(prevFormData => ({
                ...prevFormData,
                email: location.state.email
            }));
        }
    }, [location.state]);

    const [disabled, setDisabled] = React.useState(false);
    const navigate = useNavigate();
    const [snackbar, setSnackbar] = React.useState<SnackbarInterface>({
        message: "",
        severity: SnackBarSeverityLevel.WARNING,
        vertical: "top",
        horizontal: "center",
        open: false
    });
    const authContext = useAuth();
    authContext.updateClientLogo("");

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackbar({
            ...snackbar,
            open: false
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setDisabled(true);
        event.preventDefault();
        try {
            const res = await axiosHttp.post(ApiConstants.accounts.resetPassword, formData);
            if (res.status === 200 || res.data.success) {
                setSnackbar({
                    message: "Your Password Has Been Changed Successfully",
                    severity: SnackBarSeverityLevel.SUCCESS,
                    vertical: "top",
                    horizontal: "center",
                    open: true
                });
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setSnackbar({
                    message: res.data.message,
                    severity: SnackBarSeverityLevel.WARNING,
                    vertical: "top",
                    horizontal: "center",
                    open: true
                });
            }
        } catch (err) {
            setSnackbar({
                message: "Unable To Change Password. Please try again",
                severity: SnackBarSeverityLevel.ERROR,
                vertical: "top",
                horizontal: "center",
                open: true
            });
        } finally {
            setDisabled(false);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    return (
        <section className="min-h-[70svh] container">
            <SEO title={'CodePaathshala | Reset Password'} description={'Reset Password'} />
            <div className="px-4 lg:px-64 h-[70svh] flex flex-col justify-center">
                <Card className="!rounded-xl !shadow-lg">
                    <CardContent>
                        <div className="px-3 md:px-10 lg:px-12 py-10">
                            <h1 className="text-3xl text-center mb-5">Reset Password</h1>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-5">
                                    <TextField value={formData.otp} onChange={handleChange} name="otp" className="w-full" label="OTP" placeholder="Enter OTP here" type="text" />
                                </div>
                                <div className="mb-5">
                                    <TextField value={formData.newpass} onChange={handleChange} name="newpass" className="w-full" label="Password" placeholder="Enter Password here" type="password" />
                                </div>
                                <div className="mb-5">
                                    <TextField value={formData.newpass_again} onChange={handleChange} name="newpass_again" className="w-full" label="Confirm Password" placeholder="Re-Enter Password here" type="password" />
                                </div>
                                <div className="mb-3">
                                    <button disabled={disabled} type="submit" className="w-full flex justify-center gap-3 items-center px-6 py-4 bg-blue-500 rounded text-white hover:shadow-lg transition">
                                       
                                        {disabled ? <CircularProgress size={16} color="inherit" /> :  `Reset Password`}
                                    </button>
                                </div>
                            </form>
                            <p className="text-center mb-3">
                                <Link className="text-primary-500 hover:underline transition" to="/login">Back to Login</Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Snackbar anchorOrigin={{ vertical: snackbar.vertical, horizontal: snackbar.horizontal }} open={snackbar.open} autoHideDuration={5000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </section>
    );
}
