import React from "react";
import {Card, CardContent} from "@mui/material";
import {useAuth} from "hooks/AuthProvider";
import ChangePasswordForm from "components/Form/ChangePasswordForm";

export default function ChangePassword() {
    const authContext = useAuth();
    authContext.updateClientLogo("");



    return <section className="min-h-[70svh]">
        <div className="px-4 lg:px-64 h-[70svh] flex flex-col justify-center">
            <Card className="!rounded-xl !shadow-lg">
                <CardContent>
                    <div className="px-3 md:px-10 lg:px-12">
                        <h1 className="text-3xl text-center mb-5">Change Password</h1>
                        <ChangePasswordForm/>
                    </div>

                </CardContent>
            </Card>

        </div>
    </section>
}