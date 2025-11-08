import { Card, CardContent, CircularProgress, Snackbar, TextField } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { LoginRequest, SnackbarInterface } from "../_utils/interface";
import { useAuth } from "hooks/AuthProvider";
import { AxiosResponse } from "axios";
import { Logo, SnackBarSeverityLevel } from "../_utils/enum";
import { Alert } from "@mui/lab";

export default function Login() {
    const authContext = useAuth();
    const { uid } = useParams();
    useEffect(() => {
        if (uid !== undefined) {
            localStorage.setItem("uid", uid as string)
            authContext.updateClientLogo(Logo[uid as keyof typeof Logo])
        }
    }, [])
    const [formData, setFormData] = useState<LoginRequest>({
        username_or_email: "",
        password: ""
    })
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = React.useState<SnackbarInterface>({
        message: "",
        severity: SnackBarSeverityLevel.WARNING,
        vertical: "top",
        horizontal: "center",
        open: false
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(prevState => !prevState);
        event.preventDefault();
        authContext.loginAction(formData)
            .then((res: AxiosResponse) => {
                if (res.data.message === "Invalid credentials" || res.data.message === "Email does not exist" || res.data.message === "Username does not exist") {
                    setSnackbar({
                        ...snackbar,
                        open: true,
                        message: "Authentication credentials invalid. Please try again.",
                        severity: SnackBarSeverityLevel.WARNING,
                    });
                    setLoading(prevState => !prevState);
                    return;
                }
                if (res.data.token) {
                    setSnackbar({
                        ...snackbar,
                        open: true,
                        message: "Logged in successfully!",
                        severity: SnackBarSeverityLevel.SUCCESS,
                    });
                    authContext.setToken(res.data.token);
                    localStorage.setItem("accessToken", res.data.token);
                    let uid: string = localStorage.getItem("uid") as string
                    console.log(uid, 54)
                    authContext.updateClientLogo(Logo[uid as keyof typeof Logo])
                    delete res.data.token;
                    delete res.data.message;
                    authContext.setUser(res.data);
                    localStorage.setItem("profileData", JSON.stringify(res.data));
                    window.location.href = uid ? `/dashboard/${uid}` : "/dashboard";
                }
                setLoading(prevState => !prevState);
            })
            .catch((err: AxiosResponse) => {
                setSnackbar({
                    ...snackbar,
                    open: true,
                    message: "Authentication credentials invalid. Please try again.",
                    severity: SnackBarSeverityLevel.WARNING,
                });
                setLoading(prevState => !prevState);
            })
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }
    useEffect(() => {
        authContext.logOut();
        if (!uid) {
            authContext.updateClientLogo("");
        }
    }, []);

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackbar({
            ...snackbar,
            open: false
        })
    };

    return <section className="min-h-[70svh] container">
        <div className="px-4 lg:px-64 h-[70svh] flex flex-col justify-center">
            <Card className="!rounded-xl !shadow-lg">
                <CardContent>
                    <div className="px-3 md:px-10 lg:px-12 py-10">
                        <h1 className="text-3xl text-center mb-5">Login</h1>
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <div className="mb-5">
                                <TextField value={formData.username_or_email} onChange={handleChange}
                                    name="username_or_email"
                                    className="w-full" label="Username/Email" placeholder="Enter Email here"
                                    type="text"></TextField>
                            </div>
                            <div className="mb-5">
                                <TextField value={formData.password} onChange={handleChange}
                                    name="password"
                                    className="w-full" label="Password" placeholder="Enter Password here"
                                    type="password"></TextField>
                            </div>
                            <div className="mb-3">
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full flex justify-center gap-3 items-center px-6 py-4 bg-blue-500 rounded text-white hover:shadow-lg transition">
                                    Login {loading ? <CircularProgress size={16} color="inherit" /> : null}
                                </button>
                            </div>
                        </form>

                        <p className="text-center mb-3">Don't have an account? <Link
                            className="text-primary-500 hover:underline transition" to="/register">Register here</Link>
                        </p>
                        <p className="text-center">Forgot Password? <Link
                            className="text-primary-500 hover:underline transition" to="/send-otp">Reset now</Link>
                        </p>
                    </div>

                </CardContent>
            </Card>

        </div>
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

    </section>
}