import SideBar from "./components/SideBar";
import { SideBarLogProvider } from "./providers/SideBarLogProvider";

export default function DashboardLayout({ children }) {
    return (
        <section>
            <SideBarLogProvider>
                <section className={`w-full flex  bg-gradient-to-r from-black to-slate-900/70 `}>
                    <SideBar />
                    <div className="w-full">

                    {children}
                    </div>
                </section>
            </SideBarLogProvider>
        </section>
    );
}