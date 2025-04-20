import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Head, useForm } from '@inertiajs/react';

export default function Register({onSuccess}) {
    const { data, setData, post, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      });
      const handleRegisterSubmit = (e) => {
        e.preventDefault();
        post('/register', {
          onSuccess: () => reset('password', 'password_confirmation'),
        });
      };


    return (
        <>
        <Head title='Register' />
          <form onSubmit={handleRegisterSubmit}>
                                <div className="space-y-4">
                                  <div>
                                    <Input
                                      type="text"
                                      placeholder="Full Name"
                                      value={data.name}
                                      onChange={(e) => setData('name', e.target.value)}
                                      className="w-full focus:outline-none focus:ring-0 focus:border-gray-300"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                  </div>
        
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
        
                                  <div>
                                    <Input
                                      type="password"
                                      placeholder="Confirm Password"
                                      value={data.password_confirmation}
                                      onChange={(e) => setData('password_confirmation', e.target.value)}
                                      className="w-full focus:outline-none focus:ring-0 focus:border-gray-300"
                                    />
                                  </div>
        
                                  <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white">
                                    Register
                                  </Button>
                                </div>
                              </form>
                              </>
    );
}
