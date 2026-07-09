export default function DashboardPage() {
  return (
    <div>

      <h2 className="text-3xl font-bold">

        Dashboard Asset

      </h2>

      <p className="text-gray-500 mt-2">

        Selamat datang di Sistem Manajemen Asset PT Pindad.

      </p>

      <div className="grid grid-cols-4 gap-5 mt-8">

        <Card title="Total Asset" value="1.250"/>

        <Card title="Warehouse" value="6"/>

        <Card title="Maintenance" value="15"/>

        <Card title="Issues" value="4"/>

      </div>

    </div>
  );
}

function Card({
  title,
  value,
}:{
  title:string;
  value:string;
}){

  return(

    <div className="bg-white rounded-xl shadow p-6">

      <p className="text-gray-500">

        {title}

      </p>

      <h1 className="text-3xl font-bold mt-3">

        {value}

      </h1>

    </div>

  );

}