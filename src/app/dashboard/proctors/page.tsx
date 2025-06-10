import Header from "../../../components/ui/Header";
import HeaderTitle from "../../../components/ui/HeaderTitle";
import ProctorTable from "./components/ProctorTable";

export default function Page() {
  return (
    <>
    <Header><HeaderTitle>Proctors</HeaderTitle></Header>
    <ProctorTable></ProctorTable>
    </>
  );
}