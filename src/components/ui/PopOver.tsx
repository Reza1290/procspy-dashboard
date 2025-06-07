import { useEffect, useRef, useState } from "react"

const PopOver = ({ children, icon }: { children: React.ReactNode, icon: React.ReactElement }) => {

    const [isVisible, setIsVisible] = useState(false)

    const popoverRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    const toggleVisibility = () => {
        setIsVisible(!isVisible)
    }
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target) &&
                !triggerRef.current.contains(event.target)
            ) {
                setIsVisible(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }

    }, [])

    return (
        <div className="">
            <button
                ref={triggerRef}
                onClick={toggleVisibility}
            >
                {icon}
            </button>
            {
                isVisible && (
                    <div className="fixed z-[40] rounded border border-white/15  min-w-32 min-h-10 p-1 bg-gray-800 right-[5%]" ref={popoverRef}>
                        {children}
                    </div>
                )
            }
        </div>
    )
}

export default PopOver