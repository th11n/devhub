import ResourceTable from "@/components/dashboard/resource-table";

export default function Dashboard() {
  return (
    <div className="bg-[#0c0c0c] w-full px-12 pt-24 overflow-y-auto relative min-h-screen flex flex-col items-center justify-center">
      <ResourceTable />
    </div>
  );
}