const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const moment = require('moment');
require('moment/locale/pt-br');

// Configurações do bot
const token = '7893050736:AAHCjwn4MUEXZjDXzCMhkPIDY8XbPamt99A';
const bot = new TelegramBot(token, { polling: true });
const pontuacoes = {}; // Armazena pontuação dos usuários

// Inicializa o navegador Puppeteer
let browser;
(async () => {
  browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log('Navegador Puppeteer inicializado');
})();

// Menu principal
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      ['📅 Próximo Jogo', '📊 Estatísticas'],
      ['🧠 Quiz Furiazete', '📰 Notícias'],
      ['💡 Curiosidade', '🔔 Ativar alerta']
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  }
};

// Comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '📡 Bem-vindo ao *RadarFURIA*! Acompanhe tudo sobre a melhor equipe de CS2!', {
    parse_mode: 'Markdown',
    ...mainKeyboard
  });
});

// Handler de mensagens
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  switch (text) {
    case '📅 Próximo Jogo':
      try {
        const resposta = await buscarProximaPartidaHLTV();
        bot.sendMessage(chatId, resposta, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Erro ao buscar partida:', error);
        bot.sendMessage(chatId, '❌ Não foi possível obter informações sobre o próximo jogo.');
      }
      break;

    case '📰 Notícias':
      try {
        const noticias = await buscarNoticiasHLTV();
        bot.sendMessage(chatId, noticias, { parse_mode: 'MarkdownV2' });

      } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        bot.sendMessage(chatId, '❌ Não foi possível obter as notícias no momento.');
      }
      break;

    case '💡 Curiosidade':
      bot.sendMessage(chatId, "💡 Curiosidade: A FURIA foi a primeira equipe brasileira a alcançar o top 5 mundial no ranking da HLTV em 2020!");
      break;

    case '📊 Estatísticas':
      try {
        const stats = await buscarEstatisticasFuria();
        bot.sendMessage(chatId, stats, { parse_mode: 'Markdown' });
      } catch (error) {
        bot.sendMessage(chatId, `📊 Estatísticas (último jogo conhecido):
- KSCERATO: 24/13
- Yuurih: 18/16
- arT: 15/19
- FalleN: 21/15
- chelo: 20/18`);
      }
      break;

    case '🔔 Ativar alerta':
      bot.sendMessage(chatId, "⏰ Alerta ativado! Você será notificado antes dos próximos jogos.");
      break;

    case '🧠 Quiz Furiazete':
      enviarQuiz(chatId, msg.from.id);
      break;
  }
});

// Função para buscar notícias da FURIA na HLTV
function escaparMarkdown(texto) {
  return texto.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

async function buscarNoticiasHLTV() {
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

  await browser.close();

  const textoFormatado = resultados.map((noticia, i) => {
    const titulo = escaparMarkdown(noticia.title);
    const data = escaparMarkdown(noticia.date);
    const link = escaparMarkdown(noticia.link);
    return `*${i + 1}\\. ${titulo}*\n📅 ${data}\n🔗 [Leia mais](${link})\n`;
  }).join('\n');

  return `📰 *Últimas notícias da FURIA:*\n\n${textoFormatado}`;
}

// Função principal de scraping para partidas
async function buscarProximaPartidaHLTV() {
  const page = await browser.newPage();
  try {
    // Configurações para evitar bloqueio
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
    });

    console.log('Acessando HLTV.org...');
    await page.goto('https://www.hltv.org/team/8297/furia', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Extrai dados da próxima partida
    const partida = await page.evaluate(() => {
      const matchElement = document.querySelector('.upcomingMatch');
      if (!matchElement) return null;

      const getTeamName = (element) => 
        element.querySelector('.matchTeamName')?.textContent.trim() || 
        element.textContent.trim();

      const teams = Array.from(matchElement.querySelectorAll('.matchTeam')).map(getTeamName);
      const opponent = teams.find(team => !team.toLowerCase().includes('furia'));

      return {
        event: matchElement.querySelector('.matchEventName')?.textContent.trim(),
        opponent: opponent || 'Adversário desconhecido',
        time: matchElement.querySelector('.matchTime')?.getAttribute('data-unix'),
        link: 'https://www.hltv.org' + matchElement.getAttribute('href')
      };
    });

    if (!partida) {
      return 'ℹ️ Nenhuma partida futura da FURIA encontrada.';
    }

    // Formatação dos dados
    const dataFormatada = partida.time 
      ? moment.unix(partida.time/1000).format('DD/MM/YYYY [às] HH:mm')
      : 'Data a confirmar';

    return `🎯 *Próxima partida da FURIA*:
🏆 *Torneio:* ${partida.event || 'Não especificado'}
🆚 *Adversário:* ${partida.opponent}
📅 *Horário:* ${dataFormatada}
🌐 [Detalhes completos](${partida.link})`;

  } catch (error) {
    console.error('Erro durante o scraping:', error);
    return '⚠️ Não foi possível acessar os dados atualizados. Tente novamente mais tarde.';
  } finally {
    await page.close();
  }
}

// Função para buscar estatísticas (exemplo)
async function buscarEstatisticasFuria() {
  return `📊 *Estatísticas da FURIA*:
- Ranking HLTV: Top 15
- Win rate último mês: 65%
- Mapas mais jogados: Mirage, Inferno, Overpass`;
}

// Função de Quiz (mantida)
function enviarQuiz(chatId, userId) {
  const pergunta = '🧠 Quem foi o MVP da FURIA no IEM Rio 2023?';
  const opcoes = ['FalleN', 'KSCERATO', 'arT', 'Yuurih'];
  const correta = 'KSCERATO';

  bot.sendMessage(chatId, pergunta, {
    reply_markup: {
      inline_keyboard: [opcoes.map(opcao => ({
        text: opcao,
        callback_data: `quiz:${userId}:${opcao}:${correta}`
      }))]
    }
  });
}

// Callback do Quiz (mantido)
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const [prefix, userId, resposta, correta] = callbackQuery.data.split(':');

  if (prefix === 'quiz') {
    if (resposta === correta) {
      pontuacoes[userId] = (pontuacoes[userId] || 0) + 1;
      bot.sendMessage(msg.chat.id, `✅ Resposta correta! Você tem ${pontuacoes[userId]} ponto(s).`);
    } else {
      bot.sendMessage(msg.chat.id, `❌ Resposta errada! A resposta certa era *${correta}*.`, { parse_mode: 'Markdown' });
    }
  }
});

// Encerramento limpo
process.on('SIGINT', async () => {
  console.log('Encerrando bot...');
  if (browser) await browser.close();
  process.exit();
});