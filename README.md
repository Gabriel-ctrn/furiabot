# 🤖 RadarFURIA - Bot Telegram

O **RadarFURIA** é um bot para Telegram que permite aos fãs da FURIA e do CS2 se manterem atualizados com as últimas notícias, próximas partidas, estatísticas, curiosidades e quizzes interativos sobre a equipe.

---

## 📦 Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [Puppeteer](https://pptr.dev/)
- [moment.js](https://momentjs.com/)
- [HLTV.org](https://www.hltv.org/) como fonte de dados

---

## 🎮 Funcionalidades

| Comando / Opção do Menu    | Descrição                                                                 |
|----------------------------|---------------------------------------------------------------------------|
| `/start`                   | Apresenta a mensagem inicial e exibe o menu principal do bot              |
| 📅 **Próximo Jogo**        | Mostra o próximo jogo da FURIA com horário, adversário e torneio          |
| 📰 **Notícias**            | Lista as 5 notícias mais recentes da FURIA no site da HLTV                |
| 📊 **Estatísticas**        | Apresenta estatísticas básicas do time (mockadas)                         |
| 💡 **Curiosidade**         | Mostra uma curiosidade histórica sobre o time                             |
| 🔔 **Ativar alerta**       | Placeholder para futura funcionalidade de alertas de jogos                |
| 🧠 **Quiz Furiazete**      | Inicia um quiz interativo com pontuação armazenada em memória             |

---

## 🧩 Análise de Requisitos

### ✅ Requisitos Funcionais

- [x] Obter próxima partida da FURIA via scraping
- [x] Buscar últimas notícias da FURIA
- [x] Mostrar estatísticas básicas
- [x] Exibir curiosidades sobre o time
- [x] Iniciar e responder quiz interativo com feedback
- [x] Interface via bot de Telegram
- [ ] Enviar alertas automáticos de partidas (em desenvolvimento)

### ⚙️ Requisitos Não Funcionais

- [x] Suporte a múltiplos usuários simultâneos
- [x] Tempo de resposta aceitável (scraping rápido)

---

## 🛠️ Execução Local

### Pré-requisitos

- Node.js v18+
- npm

### Instalação

```bash
git clone https://github.com/seu-usuario/radarfuria.git
cd radarfuria
npm install
```

### Execução

```bash
node index.js
```

---

## 📌 Arquitetura do Bot

```text
index.js
├── inicialização do Puppeteer
├── handlers do bot (/start, mensagens, quiz)
├── buscarProximaPartidaHLTV()
├── buscarNoticiasHLTV()
├── buscarEstatisticasFuria()
└── enviarQuiz(), callback de quiz
```

---

## 📈 Exemplo de Resposta do Bot

### 📅 Próximo Jogo

```
🎯 Próxima partida da FURIA:
🏆 Torneio: IEM Katowice
🆚 Adversário: G2
📅 Horário: 05/05/2025 às 17:00
🌐 Detalhes completos: https://hltv.org/match/12345
```

### 📰 Notícias

```
📰 Últimas notícias da FURIA:

1. FURIA vence G2 em confronto épico
📅 01/05/2025
🔗 Leia mais: https://hltv.org/news/123

2. FalleN comenta momento da equipe
📅 30/04/2025
🔗 Leia mais: https://hltv.org/news/122
```

