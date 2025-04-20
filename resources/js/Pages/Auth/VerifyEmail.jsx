import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/Components/ui/button";
import { Head, Link, useForm } from "@inertiajs/react";

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route("verification.send"));
    };

    return (
        <>
            <Head title="Email Verification" />
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="logo-container">
                                <Link
                                    href="/"
                                    className="flex items-center gap-1"
                                >
                                    <div className="font-bold text-2xl text-gray-800">
                                        <span className="text-primary">X</span>
                                        <span>Motors</span>
                                        <span className="text-primary">.</span>
                                        <span>com</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Email Verification
                        </CardTitle>
                        <CardDescription>
                            {" "}
                            Thanks for signing up! Before getting started, could
                            you verify your email address by clicking on the
                            link we just emailed to you? If you didn't receive
                            the email, we will gladly send you another.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {status === "verification-link-sent" && (
                            <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
                                A new verification link has been sent to the
                                email address you provided during registration.
                            </div>
                        )}
                        <form className="space-y-4" onSubmit={submit}>
                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-hover text-white"
                                disabled={processing}
                            >
                                Resend Verification Email
                            </Button>
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                            >
                                Log Out
                            </Link>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
