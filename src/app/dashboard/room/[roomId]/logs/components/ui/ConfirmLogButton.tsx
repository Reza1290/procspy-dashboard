import { CheckIcon, XIcon } from "lucide-react";
import session from "../../../../../../../lib/session";
import { useState } from "react";
import { LogProps } from "../LogsTable";

const ConfirmLogButton = ({ id, currentLogType, callback}: { id: string, currentLogType: string, callback?: Function}) => {
    const [updated, setUpdated] = useState(null)
    const [loading, setLoading] = useState(false)
    const [savedLogType, setSavedLogType] = useState(currentLogType)

    const handleState = async (logType: string) => {
        setLoading(true)
        try {
            const jwt = await session()
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || "https://192.168.2.5:5050"}/api/update-log-type`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`,
                    },
                    body: JSON.stringify({
                        id, logType
                    })
                }
            )


            if (response.ok) {
                const data = await response.json()
                setSavedLogType(data.logType)
                setUpdated(data)
                if(callback){
                    callback(data)
                }
            } else {
                setUpdated(null)
            }
        } catch (error) {
            console.error(error)
            setUpdated(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex gap-2">
            {
                !updated && !["True","False"].includes(savedLogType) ? (
                    loading ? (<>
                        <button className="bg-red-500 text-white rounded p-1" disabled>
                            <CheckIcon></CheckIcon>
                        </button>
                        <button className="bg-white/10 border border-white/10 rounded p-1" disabled>
                            <XIcon></XIcon>
                        </button>
                    </>) : (
                        <>
                            <button className="bg-red-500 text-white rounded p-1" onClick={(e) => { handleState("True") }} >
                                <CheckIcon></CheckIcon>
                            </button>
                            <button className="bg-white/10 border dark:border-white/10 rounded p-1" onClick={() => { handleState("False") }}>
                                <XIcon></XIcon>
                            </button>
                        </>
                    )

                ) : (
                    <div className="bg-red-500 rounded p-1 text-xs">
                        Confirmed {savedLogType}
                    </div>
                )
            }
        </div>
    );
}

export default ConfirmLogButton;