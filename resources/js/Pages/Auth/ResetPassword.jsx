import InputError from '@/Components/InputError';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Head, useForm } from '@inertiajs/react';
import { Label } from "@/components/ui/label"
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
         <Head title="Reset Password" />
         <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="logo-container">
              <span className="text-3xl font-bold">
                <span className="text-blue-600">m</span>oto<span className="text-blue-600">.</span>com
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter your email and new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input  
            id="email"
            type="email"
            name="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)} />
             <InputError message={errors.email} className="mt-2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input 
                 id="password"
                 type="password"
                 name="password"
                 value={data.password}
                 onChange={(e) => setData('password', e.target.value)}
             />

             <InputError message={errors.password} className="mt-2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={data.password_confirmation}
              className="mt-1 block w-full"
              autoComplete="new-password"
              onChange={(e) =>
                  setData('password_confirmation', e.target.value)
              }
            />    
                <InputError
                    message={errors.password_confirmation}
                    className="mt-2"
                />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={processing}>
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
        </>
    );
}
