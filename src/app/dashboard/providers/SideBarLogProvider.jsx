"use client"

import { createContext, useContext, useState } from "react"

const defaultSideBarLog = {
    data: {
        isActive: false,
        consumer: {},
        token : null,
    },
    setData : () => {}
}

const SideBarLogContext = createContext(defaultSideBarLog)

export const SideBarLogProvider = ({children}) => {
    const [data,setData] = useState({
        isActive: false,
        consumer: {},
        token : null
    })

    const value = { data, setData}
    
    return (
        <SideBarLogContext.Provider value={value}>
            {children}
        </SideBarLogContext.Provider>
    )
}


export const useSideBarLog = () => useContext(SideBarLogContext)