import { LucideIcon } from "lucide-react";
import { FC } from "react";

interface SideBarItemProps {
    onClick: () => void;
    active: boolean;
    icon: LucideIcon | FC<React.SVGProps<SVGSVGElement>>;
    label: string;
}
const SideBarItem = ({ onClick, active, icon: Icon, label }: SideBarItemProps) => {
    return (
        <div className="flex gap-4 items-center group w-full">
            {active ? (
                <>
                    <div
                        onClick={onClick}
                        className="transition-all duration-500 flex w-full aspect-square bg-gray-400/15 p-2.5 rounded-md max-w-10 max-h-10 h-10 cursor-pointer border border-white/10"
                    >
                        <Icon className="transition-all duration-500 text-gray-400 text-slate-100/90" />
                    </div>
                    <div
                        onClick={onClick}
                        className="transition-all duration-500 text-sm text-slate-100/90 line-clamp-1 text-ellipsis text-nowrap bg-gray-400/15 p-2.5 rounded-md grow cursor-pointer border border-white/10"
                    >
                        {label}
                    </div>
                </>
            ) : (
                <>
                    <div
                        onClick={onClick}
                        className="transition-all duration-500 flex w-full group-hover:bg-gray-400/15 p-2.5 rounded-md max-w-10 max-h-10 h-10 cursor-pointer border border-transparent"
                    >
                        <Icon className="transition-all duration-500 text-gray-400 group-hover:text-slate-100/90" />
                    </div>
                    <div
                        onClick={onClick}
                        className="transition-all duration-500 text-sm text-slate-100/70 line-clamp-1 text-ellipsis text-nowrap group-hover:text-slate-100/90 group-hover:bg-gray-400/15 p-2.5 rounded-md grow cursor-pointer border border-transparent"
                    >
                        {label}
                    </div>
                </>
            )}
        </div>
    );
};

export default SideBarItem;
