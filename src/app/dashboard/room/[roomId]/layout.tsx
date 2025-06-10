import { LogBottomSheetProvider } from "../../../../context/LogBottomSheetProvider";
import { WebRtcProvider } from "../../../../context/WebRtcProvider";

export default function Layout({ children }) {
    return (
        <section className="h-full">
            <WebRtcProvider >
                <LogBottomSheetProvider>

                    {children}
                </LogBottomSheetProvider>
            </WebRtcProvider>
        </section>
    );
}