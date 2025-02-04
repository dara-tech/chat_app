'use client';

import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Inputs from "@/app/components/Input/Inputs";
import axios from 'axios'
import { toast } from "react-hot-toast";
import { signIn, useSession } from 'next-auth/react'
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";


type Variant = 'LOGIN' | 'REGISTER';
type LoadingState = {
  form: boolean;
  google: boolean;
  github: boolean;
}

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>('LOGIN');
  const [loadingState, setLoadingState] = useState<LoadingState>({
    form: false,
    google: false,
    github: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    if(session?.status === 'authenticated'){
      console.log('Authenticated')
      router.push('/users')
    }
  },[session?.status])

  const toggleVariant = useCallback(() => {
    setVariant(variant === 'LOGIN' ? 'REGISTER' : 'LOGIN');
    setError(null);
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      setLoadingState(prev => ({ ...prev, form: true }));
      setError(null);

      if (variant === 'REGISTER') {
        await axios.post('/api/register', data)
          .then(()=>signIn('credentials',data))
          .catch(() => toast.error('Something went wrong'))
      }

      if (variant === 'LOGIN') {
        const callback = await signIn('credentials', {
          ...data,
          redirect: false
        });

        if (callback?.error) {
          toast.error('Invalid credentials');
        }
        if (callback?.ok) {
          toast.success('Logged in');
        }
      }

      reset();
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoadingState(prev => ({ ...prev, form: false }));
    }
  };

  const socialAction = async (action: string) => {
    try {
      setLoadingState(prev => ({ ...prev, [action]: true }));
      setError(null);
      
      await signIn(action, { redirect: false });
      
    } catch (error) {
      setError(`Failed to authenticate with ${action}. Please try again.`);
    } finally {
      setLoadingState(prev => ({ ...prev, [action]: false }));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 shadow-xl rounded-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {variant === 'LOGIN' ? 'Welcome back' : 'Join us today'}
          </CardTitle>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            {variant === 'LOGIN' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {variant === 'REGISTER' && (
              <Inputs
                id="name"
                label="Name"
                register={register}
                required
                errors={errors}
                disabled={loadingState.form}
              />
            )}
            
            <Inputs
              id="email"
              label="Email"
              type="email"
              register={register}
              required
              errors={errors}
              disabled={loadingState.form}
            />
            
            <Inputs
              id="password"
              label="Password"
              type="password"
              register={register}
              required
              errors={errors}
              disabled={loadingState.form}
            />

            <Button
              type="submit"
              disabled={loadingState.form}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loadingState.form ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : null}
              {variant === 'LOGIN' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => socialAction('google')}
              variant="outline"
              className="w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-xl"
              disabled={loadingState.google}
            >
              {loadingState.google ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <FaGoogle className="w-5 h-5 mr-2 text-red-500" />
              )}
              Google
            </Button>

            <Button
              onClick={() => socialAction('github')}
              variant="outline" 
              className="w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-xl"
              disabled={loadingState.github}
            >
              {loadingState.github ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <FaGithub className="w-5 h-5 mr-2" />
              )}
              GitHub
            </Button>
          </div>
        </CardContent>
        
        <CardFooter>
          <div className="w-full text-center text-sm text-gray-500">
            {variant === 'LOGIN' ? (
              <p>
                New to our platform?{' '}
                <button
                  onClick={toggleVariant}
                  className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
                  disabled={Object.values(loadingState).some(Boolean)}
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={toggleVariant}
                  className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
                  disabled={Object.values(loadingState).some(Boolean)}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;