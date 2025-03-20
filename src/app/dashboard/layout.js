import SideBarLayout from "./components/SideBar";
import { SideBarLogProvider } from "./providers/SideBarLogProvider";

export default function DashboardLayout({ children }) {
    return (
        <section>
            <SideBarLogProvider>
                <SideBarLayout>
                    {children}
                </SideBarLayout>
            </SideBarLogProvider>
        </section>
    );
}