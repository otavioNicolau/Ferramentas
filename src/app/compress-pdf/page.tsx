import ToolLayout from '@/components/ToolLayout';

export default function CompressPdfPage() {
  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduza o tamanho de arquivos PDF mantendo a qualidade"
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Compress PDF</h3>
          <p className="text-gray-600 mb-8">Reduza o tamanho de arquivos PDF mantendo a qualidade</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-blue-800">
              <strong>✅ Disponível</strong><br />
              Esta ferramenta já está implementada em <a href="/compactar-pdf" className="underline font-medium">/compactar-pdf</a>
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
