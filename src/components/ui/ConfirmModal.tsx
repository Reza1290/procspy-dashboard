import { ReactNode } from "react"
import { useModal } from "../../context/ModalProvider"

interface ConfirmModalProps {
    element: ReactNode
    onConfirm: () => void
    onCancel?: () => void
    confirmText?: string
    cancelText?: string
}

const ConfirmModal = ({
    element,
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
        <div className="p-6 bg-black rounded-md shadow-lg max-w-md min-w-96 mx-auto border border-white/15 backdrop-blur-sm">
            {element}
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-900 border border-white/10 rounded-md text-sm"
                >
                    {cancelText}
                </button>
                <button
                    onClick={handleConfirm}
                    className="px-6 py-2 bg-slate-100 text-slate-800 rounded-md text-sm"
                >
                    {confirmText}
                </button>
            </div>
        </div>
    )
}

export default ConfirmModal
