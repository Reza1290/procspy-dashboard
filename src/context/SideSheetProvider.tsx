'use client'
import React, { createContext, useContext, useState, ReactNode } from "react"

interface SideSheetContextType {
    openSheet: (content: ReactNode) => void
    closeSheet: () => void
}

const SideSheetContext = createContext<SideSheetContextType>({
    openSheet: () => { },
    closeSheet: () => { },
})

export const useSideSheet = () => useContext(SideSheetContext)

export const SideSheetProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [content, setContent] = useState<ReactNode>(null)

    const openSheet = (node: ReactNode) => {
        setContent(node)
        setIsOpen(true)
    }

    const closeSheet = () => {
        setIsOpen(false)
        setTimeout(() => setContent(null), 200)
    }

    return (
        <SideSheetContext.Provider value={{ openSheet, closeSheet }}>
            {children}

            {isOpen && (
                <div className="fixed inset-0 z-50 pointer-events-none">
                    <div
                        onClick={closeSheet}
                        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
                            }`}
                    />

                    <div
                        className={`
            fixed top-0 bottom-0 right-0 min-w-[30rem]
            dark:bg-black bg-white border-l border-r dark:border-white/15 shadow-xl
            transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}
            pointer-events-auto
          `}
                    >
                        <div className="p-4 h-full overflow-y-auto">{content}</div>
                    </div>
                </div>
            )}
        </SideSheetContext.Provider>
    )
}
