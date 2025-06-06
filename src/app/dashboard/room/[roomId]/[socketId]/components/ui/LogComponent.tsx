import { CheckIcon, LogInIcon, XIcon } from "lucide-react";
import { LogProps } from "../LogsWindow";
import { formattedTimestampTerminal } from "../../../../../../utils/timestamp";

const LogComponent = ({ log }: { log: LogProps }) => {
    return (
        <div className="flex items-start gap-2">
            <span className="text-light text-xs py-1">[{formattedTimestampTerminal(log.timestamp)}]</span>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <LogInIcon className="w-4"></LogInIcon>
                    <span className="font-semibold text-xs">{log.flagKey}</span>
                    <span className="text-light text-xs">{log.flag?.label}</span>

                    {log.attachment?.title && (
                        <span className="bg-white/10 border border-white/10 p-1 px-2 text-xs rounded-md">{log.attachment?.title}</span>

                    )}
                    <span className="bg-red-500 rounded text-xs py-1 px-2">{log.flag?.severity}</span>
                </div>
                {
                    log.attachment?.file && (
                        <div className="flex flex-col gap-4">
                            <div className="bg-white/10 w-full aspect-video max-w-64 p-2 rounded-md border border-white/10 max-h-64">
                                <img className="rounded-md" src={`${process.env.STORAGE_ENDPOINT || 'https://192.168.2.5:5050'}` + log.attachment?.file} alt="" />
                            </div>
                            {
                                log.logType === "System" && (

                                    <div className="flex gap-2">
                                        <button className="bg-red-500 rounded p-1">
                                            <CheckIcon></CheckIcon>
                                        </button>
                                        <button className="bg-white/10 border border-white/10 rounded p-1">
                                            <XIcon></XIcon>
                                        </button>
                                    </div>
                                )
                            }

                        </div>
                    )
                }

            </div>
        </div>
    );
}

export default LogComponent;