const InputForm = ({ label, type, name, error }) => {
    return (
        <div className="flex flex-col w-full gap-2">
            <label htmlFor={name} className="font-semibold capitalize text-sm">{label}</label>
            <input type={type} id={name} name={name} className="dark:bg-white/5 border rounded-md h-10 dark:border-white/10 px-2 dark:focus:outline-white/40 text-sm" />
            {
                error ? <p className="text-sm text-white/60 ">{error}</p> : <div className="h-1"></div>
            }
        </div>
    );
}

export default InputForm;