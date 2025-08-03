export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} UtilidadeWeb. Todas as ferramentas são gratuitas e seguras.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Suas informações são processadas localmente e não são armazenadas em nossos servidores.
          </p>
        </div>
      </div>
    </footer>
  );
}
