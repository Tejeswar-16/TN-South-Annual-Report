"use client"

import { Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function District(){

    const [district,setDistrict] = useState("");

    const router = useRouter();

    function handleSubmit(e){
        e.preventDefault();
        const dis = (district.toLowerCase()).replace(/\s+/g,'-')
        router.push(`/district/${dis}`)
    }

    return (
        <>
            <div className="w-full font-sans">
                <div className="flex flex-col p-4 md:p-8 md:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-1.5">
                        <h1 className="mx-auto flex justify-center text-2xl md:text-3xl font-medium text-slate-800 leading-tight">
                        Sri Sathya Sai Balvikas
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-sm font-medium">
                        <span className="mx-auto flex justify-center text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold">Tamil Nadu South</span>
                        <span className='mx-auto flex justify-center'>District-wise Dashboard</span>
                        </div>
                    </div>
                    <div className='flex flex-row gap-x-4 justify-center mx-auto md:mx-0'>
                        <button onClick={() => router.push('/')} className='font-semibold text-yellow-700 bg-yellow-100 p-1 md:p-2 cursor-pointer hover:bg-yellow-200 hover:scale-105 rounded-xl trasition duration-300 ease-in-out'>Dashboard</button>
                    </div>
                </div>
                <div className='md: m-8 bg-gray-50 shadow-xl shadow-gray-200 p-2 md:p-4 rounded-xl flex flex-col justify-center items-center'>
                    <h1 className='text-xl font-bold mb-4'>Select District</h1>
                    
                    <form onSubmit={(e) => handleSubmit(e)}>
                        <div className='flex flex-col md:flex-row md:gap-x-50 md:text-xl'>
                            <div>
                                <input value="Coimbatore" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Coimbatore</label><br></br>

                                <input value="Dharmapuri" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Dharmapuri</label><br></br>

                                <input value="Dindigul" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Dindigul</label><br></br>

                                <input value="Erode" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Erode</label><br></br>

                                <input value="Kanyakumari" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Kanyakumari</label><br></br>

                                <input value="Karur" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Karur</label><br></br>

                                <input value="Kanchipuram North" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Kanchipuram North</label><br></br>

                                <input value="Kanchipuram South" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Kanchipuram South</label><br></br>

                                <input value="Madurai" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Madurai</label><br></br>

                                <input value="Namakkal" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Namakkal</label><br></br>

                                <input value="Nilgiris" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Nilgiris</label><br></br>

                                <input value="Salem" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Salem</label><br></br>
                            </div>
                            <div>
                                <input value="Sivagangai" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Sivagangai</label><br></br>

                                <input value="Thanjavur" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Thanjavur</label><br></br>

                                <input value="Theni" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Theni</label><br></br>

                                <input value="Tirunelveli" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Tirunelveli</label><br></br>

                                <input value="Tirupathur" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Tirupathur</label><br></br>

                                <input value="Tirupur" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Tirupur</label><br></br>

                                <input value="Tiruvannamalai" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Tiruvannamalai</label><br></br>

                                <input value="Trichy" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Trichy</label><br></br>

                                <input value="Tuticorin" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Tuticorin</label><br></br>

                                <input value="Vellore" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Vellore</label><br></br>

                                <input value="Villupuram" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Villupuram</label><br></br>

                                <input value="Virudhunagar" onChange={(e) => setDistrict(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="district"/>
                                <label className="font-sans text-lg">Virudhunagar</label><br></br>
                            </div>
                        </div>
                        <button type="submit" className='mx-auto my-4 flex justify-center bg-green-200 rounded-xl p-2 font-bold text-xl hover:cursor-pointer hover:bg-green-300 w-30 transition duration-300 ease-in-out'>Submit</button>
                    </form>
                </div>
            </div>
        </>
    )
}