'use client'
import { createContext, useContext, useState } from "react"


interface LogBottomSheetData {
    active: boolean
    token: string
}

interface DefaultLogBottomSheet {
    data: LogBottomSheetData
    setData: React.Dispatch<React.SetStateAction<LogBottomSheetData>>
}

const defaultLogBottomSheet: DefaultLogBottomSheet = {
    data: {
        active: false,
        token: ""
    },
    setData: () => { }
}


const LogBottomSheetContext = createContext(defaultLogBottomSheet)


export const LogBottomSheetProvider = ({ children }) => {

    const [data, setData] = useState({
        active: false,
        token: ""
    })

    const value = { data, setData }

    return (
        <LogBottomSheetContext.Provider value={value} >
            {children}
        </LogBottomSheetContext.Provider>
    )

}

export const useLogBottomSheet = () => useContext(LogBottomSheetContext)