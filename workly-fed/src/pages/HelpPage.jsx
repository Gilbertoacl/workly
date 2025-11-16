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
      <div className="max-w-5xl mx-auto bg-surface rounded-lg shadow-lg p-8 border border-border transition-opacity">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-6 text-textPrimary">
          📖 Central de Ajuda — Workly
        </h1>
        <p className="text-textSecondary mb-6">
          Aqui você encontra instruções, dicas e explicações sobre como utilizar
          o Workly da maneira mais eficiente.
        </p>

        <Section id="about" title="O que é o Workly?">
          O <strong>Workly</strong> é uma plataforma que organiza vagas de
          tecnologia, exibindo oportunidades capturadas automaticamente da
          internet, para facilitar sua busca.
        </Section>

        <Section id="usage" title="Como utilizar a busca de vagas?">
          <ol className="list-decimal ml-6 space-y-2">
            <li>Digite uma linguagem ou skill no campo de busca</li>
            <li>Selecione o tipo da busca (Título ou Skill)</li>
            <li>
              Clique em{" "}
              <Link
                to="/home/search"
                className="text-green-600 font-semibold hover:underline underline-offset-4"
              >
                Buscar
              </Link>
            </li>
            <li>Veja os resultados retornados na tabela</li>
          </ol>
        </Section>

        <Section id="filters" title="Modos de pesquisa suportados">
          <table className="w-full border border-border text-left rounded-md overflow-hidden">
            <thead className="bg-surfaceAlt text-textSecondary">
              <tr>
                <th className="border border-border p-2">Tipo</th>
                <th className="border border-border p-2">Descrição</th>
                <th className="border border-border p-2">Exemplo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-2">Skill</td>
                <td className="border border-border p-2">
                  Busca por tecnologia
                </td>
                <td className="border border-border p-2">
                  "Java", "Python", "SQL"
                </td>
              </tr>
              <tr>
                <td className="border border-border p-2">Titulo</td>
                <td className="border border-border p-2">
                  Busca pelo nome da vaga
                </td>
                <td className="border border-border p-2">
                  "Backend", "Fullstack"
                </td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section id="contact" title="Contato e suporte">
          Em caso de dúvidas, sugestões ou bugs, envie mensagem para:{" "}
          <a
            href="mailto:support@workly.dev"
            className="text-green-600 font-semibold hover:underline underline-offset-4 hover:cursor-pointer"
          >
            support@workly.dev
          </a>
        </Section>

        <footer className="pt-6 text-center text-textSecondary text-sm">
          Feito com 💚 para desenvolvedores — Workly ©{" "}
          {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section
      id={id}
      className="mb-8 bg-surfaceAlt p-5 rounded-lg border border-border"
    >
      <h2 className="text-xl font-bold text-textPrimary mb-2">{title}</h2>
      <div className="text-textPrimary">{children}</div>
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
