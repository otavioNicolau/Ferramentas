interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da ferramenta */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Conteúdo da ferramenta */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          {children}
        </div>

        {/* Aviso de privacidade */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>🔒 Privacidade garantida:</strong> Todos os arquivos são processados localmente no seu navegador. 
            Suas informações não são enviadas para nossos servidores.
          </p>
        </div>
      </div>
    </div>
  );
}
