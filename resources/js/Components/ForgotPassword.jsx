import React from "react";

import { ArrowLeft } from "lucide-react";

import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import InputError from "./InputError";


const ForgotPassword = ({ onReturn, resetpassstatus }) => {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("password.email"));
    };
    return (
        <>
            <Head title="Forgot Password" />
            <div className="space-y-6">
                <div className="flex items-center mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 hover:bg-transparent"
                        onClick={onReturn}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Login
                    </Button>
                </div>

                <div className="flex mt-1 items-center justify-center gap-2">
                    <Link href="/" className="flex items-center gap-1">
                        <div className="font-bold text-2xl text-gray-800">
                            <span className="text-primary">X</span>
                            <span>Motors</span>
                            <span className="text-primary">.</span>
                            <span>com</span>
                        </div>
                    </Link>
                </div>
                {resetpassstatus && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {resetpassstatus}
                    </div>
                )}
                <form onSubmit={submit}>
                    <div className="space-y-4">
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            className="w-full focus:outline-none focus:ring-0 focus:border-gray-300"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                        <Button
                            className="w-full bg-primary hover:bg-primary-hover text-white"
                            disabled={processing}
                        >
                            Password Reset Link
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ForgotPassword;
