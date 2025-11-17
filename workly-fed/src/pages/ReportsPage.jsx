import { useEffect, useState } from "react";
import api from "../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { BarChart } from "@/components/Charts/BeChart";
import { PieChart } from "@/components/Charts/PieChart";
import { Loader2 } from "lucide-react";
import CountUp from "react-countup";

export default function ReportsPage() {
  const [financial, setFinancial] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const [financialRes, contractsRes, languagesRes] = await Promise.all([
          api.get("/api/reports/financial"),
          api.get("/api/reports/summary"),
          api.get("/api/reports/languages"),
        ]);
        setFinancial(financialRes.data);
        setContracts(contractsRes.data);
        setLanguages(languagesRes.data);
      } catch (error) {
        console.error("Erro ao carregar relatórios:", error);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-textPrimary p-6 animate-fadeIn">
      <div className="max-w-6xl mx-auto">

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">📊 Relatórios — Workly</h1>
        <p className="text-textSecondary mb-10">
          Análises reais obtidas das vagas encontradas automaticamente pelo sistema.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Financial Summary */}
          <section className="col-span-1 bg-surfaceAlt/50 border border-border rounded-xl p-5 shadow-sm hover:border-green-500 transition-colors">
            <h2 className="text-xl font-semibold mb-4">💰 Resumo Financeiro</h2>

            <div className="space-y-4">
              <Card className="bg-surface border border-border shadow-sm hover:shadow-md transition">
                <CardHeader>
                  <CardTitle className="text-textPrimary">Ganho Mínimo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-green-500">
                    R$
                    <CountUp
                      end={financial?.totalMinBudget || 0}
                      duration={1.8}
                      decimals={2}
                    />
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border border-border shadow-sm hover:shadow-md transition">
                <CardHeader>
                  <CardTitle className="text-textPrimary">Ganho Máximo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-green-500">
                    R$
                    <CountUp
                      end={financial?.totalMaxBudget || 0}
                      duration={1.8}
                      decimals={2}
                    />
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border border-border shadow-sm hover:shadow-md transition">
                <CardHeader>
                  <CardTitle className="text-textPrimary">Ganho Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-green-500">
                    R$
                    <CountUp
                      end={
                        (financial?.totalMaxBudget +
                          financial?.totalMinBudget) /
                          2 || 0
                      }
                      duration={1.8}
                      decimals={2}
                    />
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Contract Status */}
          <section className="col-span-2 bg-surfaceAlt/50 border border-border rounded-xl p-5 shadow-sm hover:border-green-500 transition-colors">
            <h2 className="text-xl font-semibold mb-4">📁 Status dos Contratos</h2>
            <PieChart
              data={contracts.map((c) => ({
                name: c.status,
                value: c.totalContracts,
              }))}
            />
          </section>
        </div>

        {/* Languages */}
        <section className="mt-10 bg-surfaceAlt/50 border border-border rounded-xl p-5 shadow-sm hover:border-green-500 transition-colors">
          <h2 className="text-xl font-semibold mb-4">💻 Linguagens Mais Utilizadas</h2>
          <BarChart
            data={languages.map((l) => ({
              name: l.language,
              value: l.count,
            }))}
          />
        </section>

        <footer className="pt-6 text-center text-textSecondary text-sm mt-6">
          Workly © {new Date().getFullYear()} — dados estatísticos reais 🌎
        </footer>
      </div>
    </div>
  );
}
