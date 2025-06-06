import Header from "../../../../../components/ui/Header";
import HeaderTitle from "../../../../../components/ui/HeaderTitle";

export default function Layout({children}: {children: React.ReactNode}) {
    return (
        <section>
            <Header><HeaderTitle>Focus Mode</HeaderTitle></Header>
            {children}
        </section>
    );
}