import React from "react";

const Terms = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    Important Notice
                                </h1>
                                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    To ensure a secure and professional
                                    experience for all our users, please note
                                    the following: ✅ We only communicate
                                    through one official phone number. If you
                                    receive messages or calls claiming to be
                                    from X Motors from any other number, please
                                    ignore them and report the incident. 🔒 We
                                    do not ask for any payments, deposits, or
                                    sensitive personal information through
                                    unofficial channels. 📞 Our only official
                                    number for support and communication is:
                                    +963 
                                    Please stay cautious and avoid dealing with
                                    unauthorized individuals claiming to
                                    represent us. For any questions or concerns,
                                    feel free to reach out directly through our
                                    official number. Thank you for choosing X
                                    Motors. Your trust means everything to us.
                                </p>
                            </div>
                            <div className="mx-auto aspect-square overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last">
                                <img
                                    src="/images/logo.png"
                                    alt="Xmotors Headquarters"
                                    width={400}
                                    height={200}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Terms;
