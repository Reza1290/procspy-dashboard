import { XIcon } from "lucide-react";
import { useSideSheet } from "../../../context/SideSheetProvider";

const SheetHeader = ({children}) => {
    const {closeSheet} = useSideSheet()
    return (
        <div className="flex justify-between items-center w-full">
            <h2 className="font-semibold">{children}</h2>
            <XIcon className="w-5 cursor-pointer hover:text-slate-300" onClick={closeSheet}></XIcon>
        </div>
    );
}

export default SheetHeader;