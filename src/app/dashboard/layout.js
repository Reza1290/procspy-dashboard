import SideBarLayout from "./components/SideBar";

export default function DashboardLayout({children}) {
    return (
        <section>
            <SideBarLayout>
            {children}
            </SideBarLayout>
        </section>
    );
}