import ToolLayout from '@/components/ToolLayout';

export default function SearchablePdfPage() {
  return (
    <ToolLayout
      title="Make PDF Searchable"
      description="Torne documentos PDF pesquisáveis usando OCR"
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Make PDF Searchable</h3>
          <p className="text-gray-600 mb-8">Torne documentos PDF pesquisáveis usando OCR</p>
          
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
