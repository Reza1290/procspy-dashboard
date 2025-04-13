"use client"
import Image from "next/image";
import InputForm from "./components/InputForm";
import SubmitButton from "./components/SubmitButton";
import { useState } from "react";
import { redirect, useRouter } from "next/navigation";

export default function Page() {

    const [isLoading,setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    
    const router = useRouter()
    const onSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try{
            const formObject = {}
            const formData = new FormData(e.currentTarget)
            formData.forEach((value, key) => {
                formObject[key] = value.toString();
            });
            console.log(formObject)
            const response = await fetch('https://192.168.2.7:5050/api/login',{
                method: 'POST',
                body: JSON.stringify(formObject),
                headers : {
                    "Content-Type" : "application/json"
                },
                credentials: 'include'
            })

            const data = await response.json()
            if(response.ok){
                if(data.authenticationToken){
                    console.log('what')
                    router.push('/dashboard')
                }else{
                    setErrorMessage(data.error)
                }
            }else{
                setErrorMessage(data.error)
            }

        }catch(e){
            console.error(e)
        } finally{

            setIsLoading(false)
        }
    }

    return <div className="flex justify-between h-screen">
        <div className="flex w-full bg-white relative">
            <Image
                objectFit="cover"
                fill={true}
                alt="background"
                src={'/image/image.png'}
            ></Image>   
        </div>
        <div className="flex justify-center w-full items-center bg-gradient-to-b from-black to-slate-950">
            <form onSubmit={onSubmit} className="flex flex-col items-center gap-5 max-w-80 w-full">
                
                <h1 className="text-4xl font-bold">Login</h1>
                <h2 className="text-white/70">Login with your designated Account</h2>
                <InputForm label={'email'} name={'email'} type={'email'} error={''}></InputForm>
                <InputForm label={'password'} name={'password'} type={'password'} error={''}></InputForm>
                {
                    errorMessage && <div className="text-start text-xs flex justift-start w-full text-red-500 italic">
                        {errorMessage}
                    </div>
                }
                <SubmitButton>Login</SubmitButton>
                <div className="flex gap-1">
                <p className="text-sm text-white/70">Got some problem? </p>
                <a className="text-sm text-white"  href=""> call admin</a>
                </div>
            </form>
        </div>
    </div>
}
