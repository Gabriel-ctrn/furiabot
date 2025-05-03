const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pt-BR'
  });

  console.log('Acessando resultados de busca do HLTV...');
  await page.goto('https://www.hltv.org/search?query=furia', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  // Extrair notícias da tabela
  const resultados = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table.table > tbody > tr'));
    const noticias = [];

    rows.forEach(row => {
      const linkEl = row.querySelector('td:first-child a');
      const dateEl = row.querySelector('td.search-date');

      if (linkEl && dateEl) {
        const title = linkEl.innerText.trim();
        const link = 'https://www.hltv.org' + linkEl.getAttribute('href');
        const date = dateEl.innerText.trim();
        noticias.push({ title, link, date });
      }
    });

    return noticias.slice(0, 5);
  });

  console.log('📰 Notícias encontradas:\n');
  resultados.forEach((noticia, i) => {
    console.log(`${i + 1}. ${noticia.title}`);
    console.log(`   📅 ${noticia.date}`);
    console.log(`   🔗 ${noticia.link}\n`);
  });

  await browser.close();
})();
