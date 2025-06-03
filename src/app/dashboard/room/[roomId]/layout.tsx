import { WebRtcProvider } from "../../../../context/WebRtcProvider";

export default function Layout({children}) {
    return (
        <section className="">
            <WebRtcProvider >
                {children}
            </WebRtcProvider>
        </section>
    );
}