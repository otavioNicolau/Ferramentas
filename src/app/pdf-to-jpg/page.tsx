import ToolLayout from '@/components/ToolLayout';

export default function PdfToJpgPage() {
  return (
    <ToolLayout
      title="PDF to JPG"
      description="Converta páginas PDF para imagens JPG de alta qualidade"
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">PDF to JPG</h3>
          <p className="text-gray-600 mb-8">Converta páginas PDF para imagens JPG de alta qualidade</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-blue-800">
              <strong>✅ Disponível</strong><br />
              Esta ferramenta já está implementada em <a href="/pdf-para-imagem" className="underline font-medium">/pdf-para-imagem</a>
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
