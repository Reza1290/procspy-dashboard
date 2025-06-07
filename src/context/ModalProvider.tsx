'use client'
import React, { createContext, useContext, useState, ReactNode } from "react"

interface ModalContextType {
    active: boolean
    element: ReactNode | null
    openModal: (element: ReactNode) => void
    closeModal: () => void
    
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [active, setActive] = useState(false)
    const [element, setElement] = useState<ReactNode | null>(null)

    const closeModal = () => {
        setActive(false)
        setElement(null)
    }

    const openModal = (modalElement: ReactNode) => {
        setElement(modalElement)
        setActive(true)
    }

    return (
        <ModalContext.Provider value={{ active, element, openModal, closeModal }}>
            {children}
            {active && (
                <div
                    className=" fixed inset-0 bg-black/10 flex items-center justify-center z-[100]"
                    onClick={closeModal} 
                >
                    <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        {element}
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    )
}

export const useModal = (): ModalContextType => {
    const context = useContext(ModalContext)
    if (!context) throw new Error("useModal must be used within ModalProvider")
    return context
}
