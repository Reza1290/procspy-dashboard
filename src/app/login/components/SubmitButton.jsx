const SubmitButton = ({children}) => {
    return (
        <button className="bg-black text-white dark:bg-white rounded-md h-10 w-full dark:text-black/80 font-bold capitalize text-sm ">
            {children}
        </button>
    );
}

export default SubmitButton;