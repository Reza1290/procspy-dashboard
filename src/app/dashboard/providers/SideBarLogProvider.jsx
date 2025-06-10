"use client"

import { createContext, useContext, useState } from "react"

const defaultSideBarLog = {
    data: {
        isActive: false,
        consumer: {},
        token : null,
        refreshKey: 0
    },
    setDataSidebar : () => {}
}

const SideBarLogContext = createContext(defaultSideBarLog)

export const SideBarLogProvider = ({children}) => {
    const [data,setDataSidebar] = useState({
        isActive: false,
        consumer: {},
        token : null,
        refreshKey: 0,
    })

    const value = { data, setDataSidebar}
    
    return (
        <SideBarLogContext.Provider value={value}>
            {children}
        </SideBarLogContext.Provider>
    )
}


export const useSideBarLog = () => useContext(SideBarLogContext)