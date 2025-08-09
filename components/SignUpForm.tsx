"use client";

import { useState  } from "react";
import { useForm   } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";

// zod custom schema
import { signUpSchema } from "@/schemas/signUpSchema";


export default function SignUpForm(){

  const [ verifying, setVerifying ] = useState(false)
  const { signUp, isLoaded, setActive } = useSignUp()

  const {

    register,
    handleSubmit,
    formSubmit: { errors }
  }

  const onSubmit = async () => {}
  const handleVerificationSubmit = async () => {}

  if (verifying){

    return(

      <h1>This is OTP entering field</h1>
    )
  }
  return(

    <h1>signup form with email and other fields</h1>
  )
}