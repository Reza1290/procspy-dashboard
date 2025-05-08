import { NextRequest, NextResponse } from "next/server";
import session from "../../../lib/session";


export async function GET(req: NextRequest, res: NextResponse) {
    try {
        const {searchParams} = new URL(req.url)
        const userToken = searchParams.get("userToken")
        const token = await session()
        const response = await fetch(`${process.env.ENDPOINT}/proctored-user/${userToken}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const responseData = await response.json();
        return NextResponse.json(responseData);

    } catch (e) {
        console.error(e)
        
        return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 })
    }
}