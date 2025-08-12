#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Configuração do robots.txt com técnicas avançadas de SEO
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Template do robots.txt otimizado
function generateRobotsContent() {
  return `# Robots.txt para NICOLLAUTOOLS - Ferramentas Online
# Gerado automaticamente para máxima indexação
# Site: ${SITE_URL}
# Gerado em: ${new Date().toISOString()}

User-agent: *
Allow: /

# Permitir acesso a todos os recursos importantes
Allow: /tools
Allow: /about
Allow: /contact
Allow: /sitemap

# Permitir ferramentas populares (alta prioridade SEO)
Allow: /compactar-pdf
Allow: /compress-pdf
Allow: /dividir-pdf
Allow: /split-pdf
Allow: /juntar-pdf
Allow: /merge-pdf
Allow: /pdf-to-word
Allow: /word-to-pdf
Allow: /pdf-to-excel
Allow: /excel-to-pdf
Allow: /pdf-para-imagem
Allow: /pdf-to-jpg
Allow: /imagem-para-pdf
Allow: /jpg-to-pdf
Allow: /baixar-youtube
Allow: /baixar-tiktok
Allow: /video-para-mp3
Allow: /gerar-qrcode
Allow: /ler-qrcode
Allow: /gerador-senha

# Bloquear páginas de teste e desenvolvimento
Disallow: /test-*
Disallow: /_next/
Disallow: /api/
Disallow: /_vercel/
Disallow: /admin/
Disallow: /dashboard/

# Permitir arquivos estáticos importantes para SEO
Allow: /*.css$
Allow: /*.js$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.gif$
Allow: /*.svg$
Allow: /*.ico$
Allow: /*.webp$
Allow: /*.woff$
Allow: /*.woff2$
Allow: /*.ttf$

# Permitir indexação de todas as ferramentas por padrão
Allow: /*-pdf
Allow: /*pdf*
Allow: /pdf-*
Allow: /*-to-*
Allow: /baixar-*
Allow: /gerar-*
Allow: /ler-*
Allow: /conversor-*
Allow: /gerador-*
Allow: /calculadora
Allow: /cronometro
Allow: /bloco-notas
Allow: /contador-*
Allow: /lorem-ipsum
Allow: /encurtador-*
Allow: /teste-velocidade
Allow: /extrair-*
Allow: /hash-*
Allow: /speech-*
Allow: /compare-*
Allow: /rotate-*
Allow: /sort-*
Allow: /crop-*
Allow: /resize-*
Allow: /optimize-*
Allow: /protect-*
Allow: /unlock-*
Allow: /assinar-*
Allow: /edit-*
Allow: /repair-*
Allow: /searchable-*
Allow: /validate-*

# Configurações avançadas para SEO
# Crawl-delay para evitar sobrecarga do servidor
Crawl-delay: 1

# Referência ao sitemap XML (essencial para SEO)
Sitemap: ${SITE_URL}/sitemap.xml

# Host preferido (importante para SEO)
Host: ${SITE_URL.replace(/^https?:\/\//, '')}

# Configurações específicas para bots populares
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 2

User-agent: YandexBot
Allow: /
Crawl-delay: 1

# Bloquear bots maliciosos conhecidos
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MegaIndex
Disallow: /`
}

// Função principal
function main() {
  try {
    console.log('🤖 Gerando robots.txt otimizado para SEO...')
    console.log(`📍 Site URL: ${SITE_URL}`)
    
    // Gerar conteúdo do robots.txt
    const robotsContent = generateRobotsContent()
    
    // Salvar arquivo
    const outputPath = path.join(__dirname, '..', 'public', 'robots.txt')
    fs.writeFileSync(outputPath, robotsContent, 'utf8')
    
    console.log('✅ Robots.txt gerado com sucesso!')
    console.log(`📄 Arquivo salvo em: ${outputPath}`)
    console.log(`🔗 Sitemap referenciado: ${SITE_URL}/sitemap.xml`)
    console.log(`🌐 Host configurado: ${SITE_URL.replace(/^https?:\/\//, '')}`)
    
    // Estatísticas
    const lines = robotsContent.split('\n').length
    const allowRules = (robotsContent.match(/Allow:/g) || []).length
    const disallowRules = (robotsContent.match(/Disallow:/g) || []).length
    
    console.log(`📊 Estatísticas:`)
    console.log(`   • Total de linhas: ${lines}`)
    console.log(`   • Regras Allow: ${allowRules}`)
    console.log(`   • Regras Disallow: ${disallowRules}`)
    console.log(`   • Bots específicos configurados: 6`)
    console.log(`   • Bots maliciosos bloqueados: 5`)
    
  } catch (error) {
    console.error('❌ Erro ao gerar robots.txt:', error)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = {
  generateRobotsContent,
  main
}