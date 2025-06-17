const AlertModal = ({children}) => {
    return (
        <div className="p-6 dark:bg-black bg-white rounded-md shadow-sm max-w-md min-w-96 mx-auto border dark:border-white/15 backdrop-blur flex flex-col gap-4">
            {children}
        </div>
    );
}

export default AlertModal;