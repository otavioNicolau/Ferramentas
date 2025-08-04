import ToolLayout from '@/components/ToolLayout';

export default function JpgToPdfPage() {
  return (
    <ToolLayout
      title="JPG to PDF"
      description="Converta imagens JPG para documentos PDF"
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">JPG to PDF</h3>
          <p className="text-gray-600 mb-8">Converta imagens JPG para documentos PDF</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-blue-800">
              <strong>✅ Disponível</strong><br />
              Esta ferramenta já está implementada em <a href="/imagem-para-pdf" className="underline font-medium">/imagem-para-pdf</a>
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
