import { Award, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AboutUs = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    About Xmotors
                                </h1>
                                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Xmotors is a leading automotive company
                                    dedicated to innovation, performance, and
                                    customer satisfaction. Since our founding,
                                    we've been pushing the boundaries of what's
                                    possible in automotive engineering.
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

                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    Our Mission
                                </h2>
                                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    At Xmotors, our mission is to revolutionize
                                    the automotive industry by creating vehicles
                                    that combine cutting-edge technology,
                                    exceptional performance, and sustainable
                                    practices.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">
                                        Innovation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        We constantly push the boundaries of
                                        automotive technology to create vehicles
                                        that exceed expectations.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">
                                        Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Our vehicles are engineered for
                                        exceptional performance, delivering
                                        power, efficiency, and reliability.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">
                                        Sustainability
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        We're committed to developing
                                        eco-friendly solutions that reduce
                                        environmental impact without
                                        compromising quality.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                            <div className="space-y-4">
                                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground text-white">
                                    Achievements
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    Award-Winning Excellence
                                </h2>
                                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Our commitment to excellence has been
                                    recognized with numerous industry awards and
                                    accolades.
                                </p>
                                <ul className="grid gap-2">
                                    <li className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-primary" />
                                        <span>
                                            2025 Automotive Innovation Award
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-primary" />
                                        <span>
                                            2025 Best Electric Vehicle Design
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-primary" />
                                        <span>
                                            2025 Sustainable Manufacturing
                                            Excellence
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-primary" />
                                        <span>
                                            2025 Customer Satisfaction
                                            Leadership
                                        </span>
                                    </li>
                                </ul>
                            </div>
                            <div className="mx-auto aspect-square overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last">
                                <img
                                    src="/images/logo.png"
                                    alt="Xmotors Awards"
                                    width={400}
                                    height={200}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    Visit Us
                                </h2>
                                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Experience Xmotors in person at our
                                    showrooms and facilities.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <h3 className="text-xl font-bold">
                                        Headquarters
                                    </h3>
                                </div>
                                <p className="text-muted-foreground">
                                    123 Innovation Drive
                                    <br />
                                    Silicon Valley, CA 94025
                                    <br />
                                    United States
                                </p>
                                
                            </div>
                            <div className="mx-auto aspect-squre overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last">
                                <img
                                    src="/images/logo.png"
                                    alt="Xmotors Headquarters"
                                    width={800}
                                    height={400}
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

export default AboutUs;
