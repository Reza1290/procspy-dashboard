import { MouseEventHandler, ReactNode } from "react";

const PopOverItem = ({onClick, children}:{onClick: MouseEventHandler, children: ReactNode}) => {
    return (

        <div className="dark:hover:bg-gray-700 hover:bg-slate-100 cursor-pointer rounded-md text-sm p-1 px-2" onClick={onClick}>
            {children}
        </div>
    );
}

export default PopOverItem;