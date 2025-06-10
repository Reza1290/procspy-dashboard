import Header from "../../../components/ui/Header";
import HeaderTitle from "../../../components/ui/HeaderTitle";
import RoomTable from "./components/RoomTable";

export default function Page() {
    return (
        <div>
            <Header><HeaderTitle>
                Proctoring Rooms
            </HeaderTitle></Header>
            <RoomTable></RoomTable>
        </div>
    );
}