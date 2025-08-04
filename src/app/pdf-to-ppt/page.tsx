import ToolLayout from '@/components/ToolLayout';

export default function PdfToPptPage() {
  return (
    <ToolLayout
      title="PDF to PowerPoint"
      description="Converta documentos PDF para apresentações PowerPoint (.pptx)"
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">PDF to PowerPoint</h3>
          <p className="text-gray-600 mb-8">Converta documentos PDF para apresentações PowerPoint (.pptx)</p>
          
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
