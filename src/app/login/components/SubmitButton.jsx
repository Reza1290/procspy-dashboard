const SubmitButton = ({children}) => {
    return (
        <button className="bg-white rounded-md h-10 w-full text-black/80 font-bold capitalize text-sm">
            {children}
        </button>
    );
}

export default SubmitButton;