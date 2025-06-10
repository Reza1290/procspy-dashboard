const AlertModal = ({children}) => {
    return (
        <div className="p-6 bg-black rounded-md shadow-lg max-w-md min-w-96 mx-auto border border-white/15 backdrop-blur-sm flex flex-col gap-4">
            {children}
        </div>
    );
}

export default AlertModal;