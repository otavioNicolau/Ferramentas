import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Função para gerar estatísticas realistas baseadas no conteúdo
    const generateRealisticStats = (title: string, author: string) => {
      // Usar hash simples do título e autor para gerar números consistentes
      const hash = (title + author).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      const seed = Math.abs(hash);
      
      // Gerar números baseados no seed para serem consistentes
      const baseViews = 1000 + (seed % 50000);
      const views = baseViews + Math.floor((seed % 10) * 1000);
      const likes = Math.floor(views * (0.05 + (seed % 100) / 1000)); // 5-15% de likes
      const comments = Math.floor(likes * (0.1 + (seed % 50) / 500)); // 10-20% dos likes
      const shares = Math.floor(likes * (0.05 + (seed % 30) / 600)); // 5-10% dos likes
      
      return { likes, comments, shares, views };
    };
    
    // Testar com diferentes títulos
    const testCases = [
      { title: "Vídeo engraçado do TikTok", author: "@usuario1" },
      { title: "Dance viral 2024", author: "@dancerqueen" },
      { title: "Tutorial de culinária", author: "@chef_pro" }
    ];
    
    const results = testCases.map(test => ({
      input: test,
      stats: generateRealisticStats(test.title, test.author)
    }));
    
    return NextResponse.json({
      message: 'Teste de geração de estatísticas',
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
