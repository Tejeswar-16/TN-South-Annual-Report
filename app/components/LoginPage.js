"use client"

import { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase/config'
import { useRouter } from "next/navigation";

export default function LoginPage(){

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [loading,setLoading] = useState(false);
    const [showPassword,setShowPassword] = useState(false);

    const router = useRouter();

    async function handleLogin(e){
        try{
            e.preventDefault();
            const userCredential = await signInWithEmailAndPassword(auth,email,password);
            const userEmail = userCredential.user.email;
            if (userEmail === "admin@tnsouth.in")
                router.push("/dashboard")
            else{
                const idx = userEmail.indexOf("@");
                const district = userEmail.slice(10,idx);
                router.push(`/district/${district}`);
            }
        }
        catch(error){
            if (error.message === "Firebase: Error (auth/invalid-credential).")
                alert("Invalid email or password");
            else
                alert(error.message);
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <>
            <div className={loading ? "blur-sm pointer-events:none" : ""}>
                <div className="font-sans bg-white rounded-3xl my-15 shadow-2xl m-auto h-80 w-70 md:m-auto md:my-30 md:h-80 md:w-120">
                    <div className="pt-2 flex justify-center font-sans font-semibold text-xl md:text-2xl">
                        Sign In
                    </div>
                    <div className="font-sans p-2 text-gray-700 md:flex md:justify-center md:text-lg text-center">
                        Sri Sathya Sai Balvikas, Tamil Nadu South
                    </div>
                    <hr className="mt-2 text-gray-300"></hr>
                    <form onSubmit={handleLogin}>
                        <div className="flex justify-center">
                        <input value={email} onChange={(e) => {setEmail(e.target.value)}} required className="border border-gray-400 placeholder font-sans p-2 rounded-lg my-5 md:my-5 md:w-110 md:h-10" type="email" placeholder="Email"/>
                        </div>
                        <div className="relative">
                        <div className="flex justify-center">
                            <input value={password} 
                                onChange={(e) => {setPassword(e.target.value)}} 
                                required 
                                className="border border-gray-400 placeholder font-sans p-2 rounded-lg md:w-110 md:h-10" 
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"/>
                        </div>
                        <button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute hover:cursor-pointer right-8 top-1/2 -translate-y-1/2 text-xl text-gray-600 hover:text-gray-900">{showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}</button>
                        </div>
                        <div className="flex justify-center">
                        <button type="submit" className={(password !== "") ? "font-sans text-white text-bold bg-black rounded-lg hover:cursor-pointer my-5 w-110 h-10 mx-5 md:text-xl md:my-5 md:w-110 md:h-10" : "font-sans text-white text-bold bg-gray-400 rounded-lg hover:cursor-pointer my-5 w-110 h-10 mx-5 md:text-xl md:my-5 md:w-110 md:h-10"}>Sign In</button>
                        </div>
                    </form>
                </div>

                {loading && 
                    <>
                    <div className="fixed inset-0 flex flex-col justify-center items-center">
                        <Image className="rounded-xl" src="/swami.png" alt="swami-img" width="300" height="300"></Image>
                        <div className="font-mono m-2 text-3xl font-bold">
                        Loading...
                        </div>
                    </div>
                    </>
                }
            </div>
        </>
    )
}