import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 🎨 Mapeamento fixo de cores por tipo de contrato
const STATUS_COLORS = {
  COMPLETED: "#22c55e", 
  CANCELLED: "#ef4444",
  PENDING: "#facc15",
  ACTIVE: "#3b82f6",
};

const STATUS_NAMES = {
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  PENDING: "Pendente",
  ACTIVE: "Ativo",
};

export function PieChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhum dado disponível.</p>;
  }

  return (
    <div className="w-full h-72 bg-white dark:bg-neutral-900 rounded-2xl shadow p-4">
      {console.log("PieChart data:", data)}
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.name] || "#d1d5db"}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          />
        </RePieChart>
      </ResponsiveContainer>

      {/* 🔹 Legenda simples abaixo do gráfico */}
      <div className="flex justify-center gap-4 mt-8 text-sm text-white dark:text-gray-300">
        {Object.entries(STATUS_NAMES).map(([status, name]) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
