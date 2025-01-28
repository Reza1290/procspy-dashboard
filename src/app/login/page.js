import Image from "next/image";
import InputForm from "./components/InputForm";
import SubmitButton from "./components/SubmitButton";

export default function Page() {
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
            <div className="flex flex-col items-center gap-5 max-w-80 w-full">
                <h1 className="text-4xl font-bold">Login</h1>
                <h2 className="text-white/70">Login with your designated Account</h2>
                <InputForm label={'email'} name={'email'} type={'email'} error={''}></InputForm>
                <InputForm label={'password'} name={'password'} type={'password'} error={''}></InputForm>
                <SubmitButton>Login</SubmitButton>
                <div className="flex gap-1">
                <p className="text-sm text-white/70">Got some problem? </p>
                <a className="text-sm text-white"  href=""> call admin</a>
                </div>
            </div>
        </div>
    </div>
}
