import { Button } from "@/components/ui/button"
import { Input } from "@/Components/ui/input";
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />
            {/* {statuslogin && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {statuslogin}
                </div>
            )} */}
            <form onSubmit={submit}>
            <div className="space-y-4">
                <div>
                   <Input
                    type="email"
                     placeholder="Email"
                     value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                     className="w-full focus:outline-none focus:ring-0 focus:border-gray-300"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                    <Input
                    type="password"
                    placeholder="Password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="w-full focus:outline-none focus:ring-0 focus:border-gray-300"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                <div className="mt-4 flex items-center justify-end bg-red-600">
                    {/* {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className=" rounded-md text-sm text-blue-600 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )} */}
                             </div>
                    <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                     Login
                      </Button>
               
                </div>
            </form>
        </>
    );
}
