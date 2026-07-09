import StatisticCard from "../../components/dashboard/StatisticCard";

export default function DashboardPage() {
  return (

    <div>

      <h1 className="text-3xl font-bold mb-8">

        Dashboard

      </h1>

      <div className="grid grid-cols-4 gap-5">

        <StatisticCard
          title="Total Asset"
          value={250}
        />

        <StatisticCard
          title="Warehouse"
          value={8}
        />

        <StatisticCard
          title="Maintenance"
          value={12}
        />

        <StatisticCard
          title="Issues"
          value={5}
        />

      </div>

    </div>

  );
}