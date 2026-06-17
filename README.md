# 🤖 WhatsApp Grupo Bot — Agendador

Bot Node.js que **abre e fecha automaticamente** um grupo do WhatsApp nos horários configurados, enviando mensagens a cada ação.

---

## 📅 Agendamento padrão

| Dia          | Abertura | Fechamento |
|--------------|----------|------------|
| Quarta-feira | 08:00    | 17:00      |
| Sábado       | 08:00    | 12:00      |

---

## 📂 Estrutura de arquivos

```
whatsapp-grupo-bot/
├── index.js       ← Bot principal
├── config.js      ← ⚙️ Configurações (edite aqui)
├── package.json
├── README.md
├── auth_info/     ← Criada automaticamente (sessão WhatsApp)
└── store.json     ← Criado automaticamente (cache)
```

---

## 🚀 Instalação

### ✅ Pré-requisitos

- **Node.js 18+** instalado
- Conta WhatsApp que seja **administrador** do grupo alvo

---

### 🐧 Ubuntu / VPS ARM (produção)

```bash
# 1. Instale o Node.js 20 (compatível com ARM64)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Verifique a versão
node -v   # deve mostrar v20.x.x

# 3. Clone/copie os arquivos do bot e entre na pasta
cd whatsapp-grupo-bot

# 4. Instale as dependências
npm install

# 5. Edite o config.js com seu GROUP_JID (veja seção abaixo)
nano config.js

# 6. Inicie o bot
npm start
```

---

### 🪟 Windows

```powershell
# 1. Instale o Node.js 20 em: https://nodejs.org/
#    Baixe o instalador .msi e siga os passos

# 2. Abra o PowerShell ou CMD na pasta do projeto

# 3. Instale as dependências
npm install

# 4. Edite o config.js com o Bloco de Notas ou VS Code

# 5. Inicie o bot
npm start
```

---

### 📱 Termux (Android)

```bash
# 1. Atualize os pacotes
pkg update && pkg upgrade -y

# 2. Instale o Node.js
pkg install nodejs -y

# 3. Entre na pasta do bot
cd whatsapp-grupo-bot

# 4. Instale as dependências
npm install

# 5. Inicie o bot
npm start
```

> ⚠️ No Termux, mantenha o app em segundo plano com `termux-wake-lock` ou use um app como **Termux:Boot** para iniciar automaticamente.

---

## ⚙️ Configuração do GROUP_JID

O `GROUP_JID` é o identificador único do seu grupo no WhatsApp.

### Como descobrir:

1. No `config.js`, deixe `GROUP_JID: "SEU_GROUP_JID_AQUI"` (padrão)
2. Inicie o bot: `npm start`
3. Escaneie o QR Code com seu WhatsApp
4. O bot listará automaticamente todos os seus grupos com os JIDs
5. Copie o JID do grupo desejado (formato: `123456789-987654321@g.us`)
6. Cole em `config.js` → `GROUP_JID: "123456789-987654321@g.us"`
7. Reinicie o bot: `npm start`

---

## 💬 Comandos manuais (envie para si mesmo no WhatsApp)

| Comando   | Ação                            |
|-----------|---------------------------------|
| `!abrir`  | Abre o grupo imediatamente      |
| `!fechar` | Fecha o grupo imediatamente     |
| `!grupos` | Lista todos os grupos com JIDs  |
| `!status` | Mostra status e agendamentos    |

---

## 🔄 Manter rodando 24h na VPS (com PM2)

```bash
# Instale o PM2 globalmente
sudo npm install -g pm2

# Inicie o bot com PM2
pm2 start index.js --name "whatsapp-bot"

# Configure para iniciar automaticamente no boot
pm2 startup
pm2 save

# Comandos úteis
pm2 status              # Ver status
pm2 logs whatsapp-bot   # Ver logs em tempo real
pm2 restart whatsapp-bot
pm2 stop whatsapp-bot
```

---

## ❓ Perguntas frequentes

**O QR Code expirou antes de escanear?**  
Reinicie o bot com `npm start` (ou `pm2 restart whatsapp-bot`) — um novo QR será gerado.

**Preciso escanear o QR toda vez?**  
Não! A sessão é salva na pasta `auth_info/`. Só precisará escanear novamente se fizer logout ou apagar essa pasta.

**O bot precisa estar ligado sempre?**  
Sim, para executar os agendamentos. Use PM2 na VPS para garantir disponibilidade 24/7.

**Não sou admin do grupo, vai funcionar?**  
Não. O número do WhatsApp que você conectar ao bot **precisa ser administrador** do grupo.

**Posso mudar os horários?**  
Sim! Edite as expressões cron em `index.js`. Formato: `"minuto hora * * dia_semana"`.  
Dias da semana: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb

---

## 🛡️ Segurança

- Nunca compartilhe a pasta `auth_info/` — ela contém sua sessão do WhatsApp
- Adicione `auth_info/` e `store.json` ao `.gitignore` se usar Git

## 📄 Licença

MIT. Desenvolvido por Weslei.

