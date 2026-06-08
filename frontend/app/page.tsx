import Navbar from "@/components/Navbar";
import PredictionTable from "@/components/PredictionTable";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <PredictionTable />
      </main>
    </>
  );
}
