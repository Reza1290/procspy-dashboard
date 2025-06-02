import { WebRtcProvider } from "../../../../context/WebRtcProvider";

export default function Layout({children}) {
    return (
        <section>
            <WebRtcProvider >
                {children}
            </WebRtcProvider>
        </section>
    );
}