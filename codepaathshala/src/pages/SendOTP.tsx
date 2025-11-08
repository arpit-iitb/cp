import { Card, CardContent, CircularProgress, Snackbar, TextField } from "@mui/material";
import React from "react";
import SEO from "components/SEO";
import { Link, useNavigate } from "react-router-dom";
import axiosHttp from "../_utils/axios.index";
import { ApiConstants } from "../_utils/api-constants";
import { Alert } from "@mui/lab";
import { SnackbarInterface } from "../_utils/interface";
import { SnackBarSeverityLevel } from "../_utils/enum";
import { useAuth } from "hooks/AuthProvider";

export default function SendOTP() {
    const [formData, setFormData] = React.useState({
        email: ""
    });
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
        })
    };
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setDisabled(prevState => !prevState);
        event.preventDefault();
        axiosHttp.post(ApiConstants.accounts.sendOTP, formData).then((res) => {
            setSnackbar({
                message: `Mail sent SuccessFully`,
                severity: SnackBarSeverityLevel.SUCCESS,
                vertical: "top",
                horizontal: "center",
                open: true
            })
            setTimeout(() => {
                navigate('/reset-password', { state: { email: formData.email } });
            }, 3000)
            setDisabled(prevState => !prevState);
        })
            .catch((err) => {
                setSnackbar({
                    message: `User doesn't exist with ${formData.email}. Please try again`,
                    severity: SnackBarSeverityLevel.WARNING,
                    vertical: "top",
                    horizontal: "center",
                    open: true
                })
            })
    }
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    return <section className="min-h-[70svh]">
        <SEO title={'CodePaathshala | Reset Password'} description={'Reset Password'} />
        <div className="px-4 lg:px-48 h-[70svh] flex flex-col justify-center">
            <Card className="!rounded-xl !shadow-lg">
                <div className="pt-2 px-6">
                    <Link to={'/login'}><small className="hover:underline text-primary-500">Back to Login</small></Link>
                </div>
                <CardContent>
                    <div className="px-3 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                            <div className="col-span-3 text-[#222]">
                                <p className="text-xl mb-4">Forgotten Password?</p>
                                <p>We'll help you to login back. Please enter your registered Email-ID. We'll share an OTP to your <strong>Registered Email</strong> help you to Login.</p>
                            </div>
                            <form className="col-span-2" onSubmit={(e) => handleSubmit(e)}>
                                <div className="mb-5">
                                    <TextField value={formData.email} onChange={handleChange}
                                        name="email"
                                        required={true}
                                        className="w-full" label="Email" placeholder="Enter Email here"
                                        type="text"></TextField>
                                </div>

                                <div className="mb-3">
                                    <button
                                        type="submit"
                                        disabled={disabled}
                                        className="w-full py-3 bg-blue-500 rounded text-white hover:shadow-lg transition"
                                    >
                                        Send OTP {disabled ? <CircularProgress size={16} color="inherit" /> : null}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>

                </CardContent>
            </Card>
            <Snackbar anchorOrigin={{ vertical: snackbar.vertical, horizontal: snackbar.horizontal }} open={snackbar.open} autoHideDuration={5000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    </section>


}