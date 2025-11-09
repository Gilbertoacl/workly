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
import { formatCurrencyBRL } from "@/common/utils/UtilsGlobal";
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
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex gap-20">
        <section className="w-80">
          <h2 className="text-2xl font-bold mb-4">Resumo Financeiro</h2>
          <div className="grid grid-cols-1  gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ganho Mínimo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-green-600">
                  R$
                  <CountUp
                    end={financial?.totalMinBudget || 0}
                    duration={1.8}
                    decimals={2}
                  />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ganho Máximo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-green-600">
                  R$
                  <CountUp
                    end={financial?.totalMaxBudget || 0}
                    duration={1.8}
                    decimals={2}
                  />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ganho Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-green-600">
                  R$
                  <CountUp
                    end={
                      (financial?.totalMaxBudget + financial?.totalMinBudget) /
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

        <section>
          <h2 className="text-2xl font-bold mb-4">Status dos Contratos</h2>
          <PieChart
            data={contracts.map((c) => ({
              name: c.status,
              value: c.totalContracts,
            }))}
          />
        </section>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">Linguagens Mais Usadas</h2>
        <BarChart
          data={languages.map((l) => ({
            name: l.language,
            value: l.count,
          }))}
        />
      </section>
    </div>
  );
}
