import ToolLayout from '@/components/ToolLayout';

export default function lerqrcodePage() {
  return (
    <ToolLayout
      title="Ler QR Code"
      description="Leia códigos QR através de upload de imagem ou câmera"
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ler QR Code</h3>
          <p className="text-gray-600 mb-8">Leia códigos QR através de upload de imagem ou câmera</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-yellow-800">
              <strong> Em desenvolvimento</strong><br />
              Esta ferramenta está sendo desenvolvida e estará disponível em breve.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
