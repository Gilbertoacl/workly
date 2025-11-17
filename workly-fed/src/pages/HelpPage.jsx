import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function HelpPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <HelpSkeleton />;

  return (
    <div className="min-h-screen bg-background text-textPrimary p-6">
      <div className="max-w-5xl mx-auto bg-surface rounded-xl shadow-lg p-8 border border-border transition-opacity animate-fadeIn">
        
        {/* Title */}
        <h1 className="text-3xl font-bold mb-3 text-textPrimary">📖 Central de Ajuda — Workly</h1>
        <p className="text-textSecondary mb-8 text-base">
          Encontre instruções, dicas e explicações para tirar o máximo proveito do Workly.
        </p>

        <Section id="about" title="O que é o Workly?">
          O <strong className="text-green-500">Workly</strong> é uma plataforma que organiza vagas 
          de tecnologia automaticamente capturadas da internet, ajudando você a encontrar 
          oportunidades rapidamente.
        </Section>

        <Section id="usage" title="Como utilizar a busca de vagas?">
          <ol className="list-decimal ml-6 space-y-2">
            <li>Digite uma tecnologia no campo de busca</li>
            <li>Escolha o tipo da busca (Título ou Skill)</li>
            <li>
              Clique em{" "}
              <Link
                to="/home/search"
                className="text-green-500 font-semibold hover:underline underline-offset-4"
              >
                Buscar
              </Link>
            </li>
            <li>Veja os resultados apresentados em tabela</li>
          </ol>
        </Section>

        <Section id="filters" title="Modos de pesquisa suportados">
          <table className="w-full border border-border text-left rounded-lg overflow-hidden text-sm">
            <thead className="bg-surfaceAlt text-textSecondary">
              <tr>
                <th className="border border-border p-3">Tipo</th>
                <th className="border border-border p-3">Descrição</th>
                <th className="border border-border p-3">Exemplo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-surface transition">
                <td className="border border-border p-3">Skill</td>
                <td className="border border-border p-3">Busca por tecnologia</td>
                <td className="border border-border p-3">"Java", "Python", "React"</td>
              </tr>
              <tr className="hover:bg-surface transition">
                <td className="border border-border p-3">Título</td>
                <td className="border border-border p-3">Busca pelo nome da vaga</td>
                <td className="border border-border p-3">"Backend", "Tech Lead"</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section id="contact" title="Contato e suporte">
          Caso precise de ajuda, tenha sugestões ou encontrou um problema, fale com a gente:{" "}
          <a
            href="mailto:support@workly.dev"
            className="text-green-500 font-semibold hover:underline underline-offset-4 hover:cursor-pointer"
          >
            support@workly.dev
          </a>
        </Section>

        <footer className="pt-6 text-center text-textSecondary text-sm border-t border-border mt-4">
          Feito com 💚 para Devs — Workly © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section
      id={id}
      className="mb-8 bg-surfaceAlt/50 p-5 rounded-lg border border-border hover:border-green-600 transition-colors"
    >
      <h2 className="text-lg font-semibold text-textPrimary mb-2 flex items-center gap-2">
        <span className="block w-1.5 h-6 bg-green-500 rounded-full"></span>
        {title}
      </h2>
      <div className="text-textPrimary leading-relaxed">{children}</div>
    </section>
  );
}

function HelpSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 animate-pulse">
      <div className="max-w-5xl mx-auto bg-surface rounded-lg p-8 border border-border">
        <div className="h-8 w-64 bg-surfaceAlt rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="bg-surfaceAlt border border-border rounded p-5 space-y-3"
            >
              <div className="h-4 w-1/3 bg-background rounded"></div>
              <div className="h-3 w-full bg-background rounded"></div>
              <div className="h-3 w-4/5 bg-background rounded"></div>
              <div className="h-3 w-2/3 bg-background rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
