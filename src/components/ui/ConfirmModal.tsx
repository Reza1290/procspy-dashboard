import { ReactNode } from "react"
import { useModal } from "../../context/ModalProvider"

interface ConfirmModalProps {
    children: ReactNode
    onConfirm: () => void
    onCancel?: () => void
    confirmText?: string
    cancelText?: string
}

const ConfirmModal = ({
    children,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
}: ConfirmModalProps) => {
    const { closeModal } = useModal()

    const handleConfirm = () => {
        onConfirm()
        closeModal()
    }

    const handleCancel = () => {
        if (onCancel) onCancel()
        closeModal()
    }

    return (
        <div className="p-6 dark:bg-black bg-white rounded-md shadow-sm max-w-md min-w-96 mx-auto border dark:border-white/15 backdrop-blur-xl flex flex-col gap-4">
            {children}
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={handleCancel}
                    className="px-6 py-2 dark:bg-gray-900 border dark:border-white/10 rounded-md text-sm"
                >
                    {cancelText}
                </button>
                <button
                    onClick={handleConfirm}
                    className="px-6 py-2 dark:bg-slate-100 dark:text-slate-800 bg-black text-white rounded-md text-sm"
                >
                    {confirmText}
                </button>
            </div>
        </div>
    )
}

export default ConfirmModal
