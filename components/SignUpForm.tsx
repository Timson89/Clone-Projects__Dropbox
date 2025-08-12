"use client"; // Client side


// Dependencies/Packages

import { useState  } from "react";
import { useForm   } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";

import { z } from "zod";

// zod custom schema
import { useRouter    } from "next/navigation";
import { zodResolver  } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/schemas/signUpSchema";

// lucide icons
import { AlertCircle, CheckCircle, Eye, EyeOff, Link, Lock, Mail } from "lucide-react";

// hero ui packages
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { Button  } from "@heroui/react";
import { Input   } from "@heroui/react";
import { Divider } from "@heroui/react";


export default function SignUpForm(){


  const router = useRouter();

  const [ showPassword, setShowPassword ]               = useState(false);
  const [ showConfirmPassword, setShowConfirmPassword ] = useState(false);
  const [ verifying, setVerifying ]                     = useState(false);
  const [ isSubmitting, setIsSubmitting ]               = useState(false);
  const [ verificationCode, setVerificationCode ]       = useState("");
  const [ authError, setAuthError ]                     = useState<string | null>(null);
  const [ verificationError, setVerificationError ]     = useState<string | null>(null);

  const { signUp, isLoaded, setActive } = useSignUp()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm <z.infer<typeof signUpSchema>> ({
    resolver: zodResolver(signUpSchema),
      defaultValues: {
        email: (""),
        password: (""),
        passwordConfirmation: ("")
      },
    }
  );

  const onSubmit = async ( data: z.infer <typeof signUpSchema> ) => {

    if (!isLoaded) return;
      setIsSubmitting(true);
      setAuthError(null);
    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password
      })
      await signUp.prepareEmailAddressVerification({
        strategy: ("email_code")
      }) 
      setVerifying(true);
    } catch ( error: any ){
      console.error("Signup error: ", error)
      setAuthError(
        error.errors?.[0]?.message || 

        ("An error occured during the signup. Please try again"),
      )
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async ( e: React.FormEvent <HTMLFormElement> ) => {

    e.preventDefault();
    if (!isLoaded || !signUp) return;
      setIsSubmitting(true);
      setAuthError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      // Todo: console result
      if ( result.status === ("complete") ){
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard")
      } else {
        console.error("verification incomplete", result);
        setVerificationError(

          ("Verification could not be completed")
        )
      }
    } catch ( error: any ){
      console.error("verification incomplete", error);
      ("Verification could not be completed");
      setVerificationError(
        error.errors?.[0]?.message || 
        
        ("An error occured during the signup. Please try again"),
      )
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verifying){

    return (

      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-default-900">
         Verify Your Email
          </h1>
          <p className="text-default-500 text-center">

            We've sent a verification code to your email.

          </p>
        </CardHeader>

        <Divider />

        <CardBody className="py-6">
          { verificationError && (
            <div className="flex items-center gap-2 bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 ">
              <AlertCircle className="flex-shrink-0 h-5 w-5" />
              <p>
                
                { verificationError }

              </p>
            </div>
           )
          }
          <form onSubmit={ handleVerificationSubmit } className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="verificationCode" className="text-sm font-medium text-default-900">

                Verification Code

              </label>
              <Input className="w-full" 
                id="verificationCode"
                type="text"
                placeholder="Enter the 6-digit code"
                value={ verificationCode }
                onChange={(e) => setVerificationCode(e.target.value)}
                autoFocus 
              />
            </div>

            <Button className="w-full"
              type="submit"
              color="primary"
              isLoading={ isSubmitting }
            > 
              { isSubmitting ? ( "Verifying...") : ("Verifying Email") }
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-default-500">
           Didn't receive a code?{" "}
              <button className="text-primary hover:underline font-medium"
                onClick={ async () => {
                  if (signUp){
                    await signUp.prepareEmailAddressVerification({
                      strategy: ("email_code"),
                    });
                  }
                }}
              >

                Resend Code
                
              </button>
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }
  return (
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-default-900">

            Create Your Account

          </h1>
          <p className="text-default-500 text-center">

            Sign up to start managing your images securely.

          </p>
        </CardHeader>

        <Divider />

        <CardBody className="py-6">
          { authError && (
            <div className="flex items-center gap-2 bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 ">
              <AlertCircle className="flex-shrink-0 h-5 w-5" />
                <p>
                  
                  { authError }

                </p>
            </div>
          )}

          <form onSubmit={ handleSubmit(onSubmit) } className="space-y-2">
            <div className="space-y-6">
              <label htmlFor="email" className="text-sm font-medium text-default-900">

                Email

              </label>
              <Input className="w-full"
                id="email"
                type="text"
                placeholder="your.email@example.com"
                startContent={ <Mail className="h-4 w-4 text-default-500" /> }
                isInvalid={ !!errors.email }
                errorMessage={ errors.email?.message }
                { ...register("email") }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-default-900">

                Password

              </label>
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
                      <Eye className="h-4 w-4 text-default-500" />
                    )}
                  </Button> 
                }
                isInvalid={ !!errors.password }
                errorMessage={ errors.password?.message }
                { ...register("password") }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="passwordConfirmation" className="text-sm font-medium text-default-900">

                Confirm Password
                
              </label>
              <Input className="w-full"
                id="passwordConfirmation"
                type={ showConfirmPassword ? ("text") : ("password") }
                placeholder="********"
                startContent={ <Lock className="h-4 w-4 text-default-500" /> }
                endContent={
                  <Button className="w-full"
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={ () => setShowConfirmPassword(!showConfirmPassword) }
                    type="button"
                  >
                    { showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-default-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-default-500" />
                    )}
                  </Button>
                }
                isInvalid={ !!errors.passwordConfirmation }
                errorMessage={ errors.passwordConfirmation?.message }
                { ...register("passwordConfirmation") }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-start-gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-default-600">

                  By signing up, you agree to our Terms of Service and Privacy Policy.

                </p>
              </div>
            </div>

            <Button className="w-full"
              type="submit"
              color="primary"
              isLoading={ isSubmitting }
            >
             { isSubmitting ? "Creating Account..." : "Create Account" }
            </Button>
          </form>
        </CardBody>
      <CardFooter className="flex justify-content py-4">
        <p className="text-sm text-default-600">
          
          Already have an account?{" "}

          <Link className="text-primary hover:underline font-medium">

            Sign In

          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}