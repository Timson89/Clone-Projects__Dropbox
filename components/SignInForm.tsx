"use client"


// Dependencies/Packages

import { useState  } from "react";
import { useForm   } from "react-hook-form";
import { useSignIn } from "@clerk/nextjs";

import { z } from "zod"

// zod custom schema
import { useRouter    } from "next/navigation";
import { zodResolver  } from "@hookform/resolvers/zod";
import { signInSchema } from "@/schemas/signInSchema";

// hero ui packages
import { Card } from "@heroui/react";


export default function SignInForm(){


  const router = useRouter();

  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [ authError, setAuthError ]       = useState<string | null>(null);

  const { signIn, isLoaded, setActive } = useSignIn();

  const { 
    register,
    handleSubmit
  } = useForm({
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
      })
      if (result.status === "complete"){
        await setActive({ session: result.createdSessionId });
      } else {
        setAuthError("Sign in error")
      }
    } catch ( error: any ) {
      setAuthError(
        error.errors?.[0]?.message || 
        
        ("An error occured during sign in process"),
      )
    } finally {
      setIsSubmitting(false);
    }
  }

  return (

    <Card className="w-full, ">

    </Card>
  )
}