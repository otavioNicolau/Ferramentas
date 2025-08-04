import ToolLayout from '@/components/ToolLayout';

export default function RotatePagesPage() {
  return (
    <ToolLayout
      title="Rotate PDF Pages"
      description="Rotacione páginas de documentos PDF em qualquer ângulo"
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Rotate PDF Pages</h3>
          <p className="text-gray-600 mb-8">Rotacione páginas de documentos PDF em qualquer ângulo</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-yellow-800">
              <strong>🚧 Em desenvolvimento</strong><br />
              Esta ferramenta está sendo desenvolvida e estará disponível em breve.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
