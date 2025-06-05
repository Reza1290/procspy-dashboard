import Header from "../../../components/ui/Header";
import HeaderTitle from "../../../components/ui/HeaderTitle";
import SettingTable from "./components/SettingTable";

export default function Page() {
    return (
        <>
            <Header><HeaderTitle>Global Variable Settings</HeaderTitle></Header>
            <SettingTable></SettingTable>
        </>
    );
}