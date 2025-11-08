import React from "react";
import { useAuth } from "hooks/AuthProvider";
import { Card, CardContent } from "@mui/material";
import RegisterForm from "components/Form/RegisterForm";

export default function Register({ }) {

    const authContext = useAuth();
    
    // authContext.updateClientLogo("");
    // eslint-disable-next-line

    return <section className="min-h-[110svh] container text-[#222]">
        {/*<p className="text-center font-light text-xl mb-4">Sorry, registrations are closed for now.</p>*/}
        {/*<p className="text-center">Stay tuned for future opportunities 🚀✨</p>*/}
        {/*<div className="flex justify-center w-full h-full">*/}
        {/*    /!*<img alt="waiting" src="assets/images/chair_person.png"/>*!/*/}
        {/*</div>*/}

        <div className="px-4 lg:px-64 h-[10svh]">
            <Card className="!rounded-xl !shadow-lg">
                <CardContent>
                    <div className="px-3 md:px-10 lg:px-12 py-10">
                        <h1 className="text-3xl text-center mb-5">Register Now</h1>
                        <div className="mb-5 items-center flex justify-center">
                            <RegisterForm />

                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>

    </section>
}