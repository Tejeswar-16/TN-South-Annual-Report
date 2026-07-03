"use client"

import { useEffect, useState } from "react";
import DashboardClient from "../components/DashboardClient";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";

export default function Dashboard(){

    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            console.log(user);
            if (!user) {
                router.replace("/");
            } else {
                setAuthorized(true);
            }
        });
    }, [router]);

    if (!authorized) {
        return <p>Loading...</p>;
    }

    return <DashboardClient />;
}