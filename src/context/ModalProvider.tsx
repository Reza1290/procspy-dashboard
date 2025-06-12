'use client'
import React, { createContext, useContext, useState, ReactNode } from "react"

interface ModalContextType {
    active: boolean
    element: ReactNode | null
    openModal: (element: ReactNode, canClickOutside?: boolean) => void
    closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [active, setActive] = useState(false)
    const [element, setElement] = useState<ReactNode | null>(null)
    const [canClickOutside, setCanClickOutside] = useState(false)
    const closeModal = () => {
        setActive(false)
        setElement(null)
    }

    const openModal = (modalElement: ReactNode, canClickOutside = false) => {
        setElement(modalElement)
        setActive(true)
        setCanClickOutside(canClickOutside)
    }

    return (
        <ModalContext.Provider value={{ active, element, openModal, closeModal}}>
            {children}
            {active && (
                <div
                    className=" fixed inset-0 bg-black/10 flex items-center justify-center z-[100]"
                    onClick={canClickOutside ? closeModal : () => {}} 
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
