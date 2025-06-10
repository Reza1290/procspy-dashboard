import Header from "../../../components/ui/Header";
import HeaderTitle from "../../../components/ui/HeaderTitle";
import ProctoredUserTable from "./components/ProctoredUserTable";

export default function Page() {
  return (
    <>
    <Header><HeaderTitle>Proctored Users</HeaderTitle></Header>
    <ProctoredUserTable></ProctoredUserTable>
    </>
  );
}