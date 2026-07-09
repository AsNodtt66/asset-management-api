import Card from "../ui/Card";

interface Props {
  title: string;
  value: number;
}

export default function StatisticCard({
  title,
  value,
}: Props) {
  return (
    <Card>

      <p className="text-gray-500">

        {title}

      </p>

      <h2 className="text-3xl font-bold mt-2">

        {value}

      </h2>

    </Card>
  );
}