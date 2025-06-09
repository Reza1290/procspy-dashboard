import { useEffect, useRef, useState } from "react";
import PopOver from "../../../../../../components/ui/PopOver";
import PopOverItem from "../../../../../../components/ui/PopOverItem";
import { FlagIcon, PanelLeftOpenIcon, PanelRightOpenIcon } from "lucide-react";
import { useSideSheet } from "../../../../../../context/SideSheetProvider";
import SheetHeader from "../../../../../../components/ui/sheet/SheetHeader";
import { LogProps } from "../../../../room/[roomId]/logs/components/LogsTable";
import { formattedTimestamp } from "../../../../../utils/timestamp";

function DraggableTimeline({ timeline, n = 4, handleRenderImage, currentId }) {
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const { openSheet, closeSheet } = useSideSheet()


    useEffect(() => {
        console.log("curr", currentId)
        scrollToId(currentId)
    }, [currentId])
    const onMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setScrollLeft(containerRef.current.scrollLeft);
    };

    const onMouseLeave = () => {
        setIsDragging(false);
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        containerRef.current.scrollLeft = scrollLeft - walk;
    };

    const onWheel = (e) => {
        e.preventDefault();
        containerRef.current.scrollLeft += e.deltaY;
    };

    const handleMultipleFlag = (logs: LogProps[]) => {
        openSheet(
            <div className="w-96 flex flex-col gap-4 h-full">
                <SheetHeader>Select Flag</SheetHeader>
                <p className="text-sm text-slate-500 mb-20">Click to show the flag or log.</p>

                {
                    logs.map((e) => (
                        <div key={e.id} className="flex flex-col gap-2 mt-2" onClick={() => {
                            handleRenderImage(e.id)
                            closeSheet()
                        }}>
                            <label htmlFor="identifier" className="text-sm text-slate-100 font-medium">{e.flagKey}</label>
                            <div className="flex gap-2 w-full">
                                <div className="p-2 text-sm px-2 bg-white/5 border border-white/15 rounded-md w-full">
                                    {formattedTimestamp(e.timestamp)}
                                </div>
                                <div className="bg-blue-500 p-2 px-2 rounded-md text-xs flex justify-center items-center w-16">
                                    <PanelLeftOpenIcon className="w-4" />
                                </div>
                            </div>
                        </div>
                    ))
                }

            </div>
        )
    }
    const scrollToId = (id: string) => {
        const el = document.getElementById(`flag-${id}`);
        console.log(el)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return (
        <div
            ref={containerRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onWheel={onWheel}
            className="overflow-x-scroll overflow-y-hidden whitespace-nowrap cursor-grab select-none"
            style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
            }}
        >
            <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

            {timeline.map((slot, idx) => (
                <div
                    key={idx}
                    className="inline-block align-bottom mx-2 text-center select-text cursor-default relative mt-12 mb-10   "
                >
                    {/* Floating PopOver if logs exist */}
                    {slot.logs.length > 0 &&
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                            {
                                slot.logs.length > 1 ? (
                                    <div onClick={() => handleMultipleFlag(slot.logs)} className="relative w-12 h-12 flex justify-center rounded-t hover:bg-white/20 bg-white/10 border-b-4 border-white/10 hover:border-white/20 transition-all" >
                                        {slot.logs.map((e) => (<div key={e.id} className="invisible" id={"flag-" + e.id}></div>))}
                                        <FlagIcon className="w-4 left-1 relative"></FlagIcon>
                                        <FlagIcon className="w-4 right-1 relative"></FlagIcon>
                                    </div>
                                ) : (
                                    <div onClick={() => handleRenderImage(slot.logs[0].id)} className="cursor flex justify-center cursor-pointer w-12 h-12 rounded-t hover:bg-white/20 bg-white/10 border-b-4 border-white/10 hover:border-white/20 transition-all" >
                                        <div className="invisible" id={"flag-" + slot.logs[0].id}></div>
                                        <FlagIcon className="w-4"></FlagIcon>
                                    </div>
                                )
                            }


                        </div>
                    }

                    {/* Timeline tick */}
                    {idx % n === 0 ? (
                        <div className="bg-white border border-white h-4 w-1 rounded-t mx-auto relative" >
                            <div className="absolute top-6 -left-2 text-[8px]  text-slate-100/50">
                                {idx / 4} m
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/50 border border-white h-2 mt-2 w-1 rounded-t mx-auto" />
                    )}


                </div>



            ))}
        </div>
    );
}

export default DraggableTimeline;
