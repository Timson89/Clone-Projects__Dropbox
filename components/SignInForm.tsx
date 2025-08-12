"use client"; // Client side


// Dependencies/Packages

import { useState  } from "react";
import { useForm   } from "react-hook-form";
import { useSignIn } from "@clerk/nextjs";

import Link from "next/link";

import { z } from "zod";

// zod custom schema
import { useRouter    } from "next/navigation";
import { zodResolver  } from "@hookform/resolvers/zod";
import { signInSchema } from "@/schemas/signInSchema";

// lucide icons
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";

// hero ui packages
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input } from "@heroui/react";


export default function SignInForm(){


  const router = useRouter();

  const [ showPassword, setShowPassword ] = useState(false);
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [ authError, setAuthError ]       = useState<string | null>(null);

  const { signIn, isLoaded, setActive } = useSignIn();

  const { 
    register,
    handleSubmit,
    formState: { errors }
    
  } = useForm<z.infer<typeof signInSchema>> ({
    resolver: zodResolver(signInSchema),
      defaultValues: {
        identifier: (""),
        password: ("")
      },
    }
  );

  const onSubmit = async ( data: z.infer <typeof signInSchema> ) => {

    if (!isLoaded) return;
      setIsSubmitting(true);
      setAuthError(null);

    try {
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password
      });
      if (result.status === "complete"){
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error("Sign-in incomplete: ", result);
        setAuthError("Sign-in could not be completed. please try again.");
      }
    } catch ( error: any ) {
      console.error("Sign-in error: ", error);
      setAuthError(
        error.errors?.[0]?.message || 
        
        ("An error occurred during sign-in. Please try again."),
      )
    } finally {
      setIsSubmitting(false);
    }
  }

  return (

    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
      <CardHeader className="flex flex-col items-center gap-1 pb-2">
        <h1 className="text-2xl font-bold text-default-900">

          Welcome back

        </h1>
        <p className="text-default-500 text-center">

          Sign in to access your secure cloud storage

        </p>
      </CardHeader>

      <Divider />

      <CardBody className="py-6">
        { authError && (
          <div className="flex items-center gap-2 bg-danger-50 text-danger-700 p-4 rounded-lg mb-6">
            <AlertCircle className="flex-shrink-0 h-5 w-5" />
            <p>

              { authError }

            </p>
          </div>
          )
        }

        <form onSubmit={ handleSubmit(onSubmit) } className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="identifier" className="text-sm font-medium text-default-900">

              Email

            </label>
            <Input className="w-full"
              id="identifier"
              type="email"
              placeholder="your.email@example.com"
              startContent={ <Mail className="h-4 w-4 text-default-500" /> }
              isInvalid={ !!errors.identifier }
              errorMessage={ errors.identifier?.message }
              { ...register("identifier") }
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="" className="text-sm font-medium text-default-900">

                Password

              </label>
            </div>
            <Input className="w-full"
              id="password"
              type={ showPassword ? ("text") : ("password") }
              placeholder="********"
              startContent={ <Lock className="h-4 w-4 text-default-500" /> }
              endContent={ 
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={ () => setShowPassword(!showPassword) }
                  type="button"
                >
                  { showPassword ? (
                    <EyeOff className="h-4 w-4 text-default-500" /> 
                    ) : (
                    <Eye    className="h-4 w-4 text-default-500" />
                    )
                  }
                </Button>
              }
              isInvalid={ !!errors.password }
              errorMessage={ errors.password?.message }
              { ...register("password") }
            />
          </div>

          <Button className="w-full"
            type="submit"
            color="primary"
            isLoading={ isSubmitting }
          >

            { isSubmitting ? ("Signing in...") : ("Sign In") }
            
          </Button>
        </form>
      </CardBody>

      <Divider />

      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-default-600">

          Don't have an account?{" "};

          <Link href="/sign-up" className="text-primary hover:underline font-medium">

            Sign Up
          
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}