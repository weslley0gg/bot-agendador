const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");

const { Boom } = require("@hapi/boom");
const cron = require("node-cron");
const pino = require("pino");
const qrcode = require("qrcode-terminal");
const config = require("./config");

// ─── Logger silencioso (menos poluição no console) ────────────────────────────
const logger = pino({ level: "silent" });

// ─── Variável global do socket ─────────────────────────────────────────────────
let sock = null;
let reconectando = false;

// ══════════════════════════════════════════════════════════════════════════════
//  FUNÇÕES UTILITÁRIAS
// ══════════════════════════════════════════════════════════════════════════════

function log(msg, tipo = "INFO") {
  const agora = new Date().toLocaleString("pt-BR", {
    timeZone: config.TIMEZONE,
  });
  const icone = { INFO: "ℹ️", OK: "✅", ERRO: "❌", AVISO: "⚠️", CRON: "⏰" }[tipo] || "•";
  console.log(`[${agora}] ${icone} ${msg}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ══════════════════════════════════════════════════════════════════════════════
//  AÇÕES NO GRUPO
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Abre o grupo: permite que todos os participantes enviem mensagens.
 * Depois envia a mensagem de abertura.
 */
async function abrirGrupo() {
  if (!sock) return log("Socket não disponível. Aguarde a conexão.", "ERRO");

  try {
    log("Abrindo o grupo...", "CRON");

    // not_announcement = todos podem enviar
    await sock.groupSettingUpdate(config.GROUP_JID, "not_announcement");
    log("Grupo aberto com sucesso!", "OK");

    await sleep(1500);

    await sock.sendMessage(config.GROUP_JID, {
      text: config.MSG_ABERTURA,
    });
    log("Mensagem de abertura enviada.", "OK");
  } catch (err) {
    log(`Erro ao abrir grupo: ${err.message}`, "ERRO");
  }
}

/**
 * Fecha o grupo: apenas administradores podem enviar mensagens.
 * Depois envia a mensagem de fechamento.
 */
async function fecharGrupo() {
  if (!sock) return log("Socket não disponível. Aguarde a conexão.", "ERRO");

  try {
    log("Fechando o grupo...", "CRON");

    // announcement = somente admins podem enviar
    await sock.groupSettingUpdate(config.GROUP_JID, "announcement");
    log("Grupo fechado com sucesso!", "OK");

    await sleep(1500);

    await sock.sendMessage(config.GROUP_JID, {
      text: config.MSG_FECHAMENTO,
    });
    log("Mensagem de fechamento enviada.", "OK");
  } catch (err) {
    log(`Erro ao fechar grupo: ${err.message}`, "ERRO");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  AGENDAMENTOS (CRON)
// ══════════════════════════════════════════════════════════════════════════════

function iniciarAgendamentos() {
  log("Registrando agendamentos...", "INFO");

  // ── Quarta-feira: abrir às 08:00 ────────────────────────────────────────────
  cron.schedule(
    "0 8 * * 3",
    () => {
      log("Gatilho QUARTA 08:00 — abrindo grupo", "CRON");
      abrirGrupo();
    },
    { timezone: config.TIMEZONE }
  );

  // ── Quarta-feira: fechar às 17:00 ───────────────────────────────────────────
  cron.schedule(
    "0 17 * * 3",
    () => {
      log("Gatilho QUARTA 17:00 — fechando grupo", "CRON");
      fecharGrupo();
    },
    { timezone: config.TIMEZONE }
  );

  // ── Sábado: abrir às 08:00 ──────────────────────────────────────────────────
  cron.schedule(
    "0 8 * * 6",
    () => {
      log("Gatilho SÁBADO 08:00 — abrindo grupo", "CRON");
      abrirGrupo();
    },
    { timezone: config.TIMEZONE }
  );

  // ── Sábado: fechar às 12:00 ─────────────────────────────────────────────────
  cron.schedule(
    "0 12 * * 6",
    () => {
      log("Gatilho SÁBADO 12:00 — fechando grupo", "CRON");
      fecharGrupo();
    },
    { timezone: config.TIMEZONE }
  );

  log("Agendamentos ativos:", "OK");
  log("  📅 Quarta-feira → Abre 08:00 | Fecha 17:00", "INFO");
  log("  📅 Sábado       → Abre 08:00 | Fecha 12:00", "INFO");
}

// ══════════════════════════════════════════════════════════════════════════════
//  LISTAR GRUPOS (helper para descobrir o GROUP_JID)
// ══════════════════════════════════════════════════════════════════════════════

async function listarGrupos() {
  if (!sock) return;
  try {
    const grupos = await sock.groupFetchAllParticipating();
    console.log("\n══════════════════════════════════════");
    console.log("  GRUPOS QUE VOCÊ PARTICIPA");
    console.log("══════════════════════════════════════");
    Object.values(grupos).forEach((g) => {
      console.log(`  Nome : ${g.subject}`);
      console.log(`  JID  : ${g.id}`);
      console.log("  ──────────────────────────────────────");
    });
    console.log(
      "\n👉 Copie o JID desejado e cole em config.js → GROUP_JID\n"
    );
  } catch (err) {
    log(`Erro ao listar grupos: ${err.message}`, "ERRO");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONEXÃO COM WHATSAPP
// ══════════════════════════════════════════════════════════════════════════════

async function conectar() {
  const { state, saveCreds } = await useMultiFileAuthState(config.AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  log(`Usando Baileys versão ${version.join(".")}`, "INFO");

  sock = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: false,
    browser: ["WhatsApp Bot", "Chrome", "1.0.0"],
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
  });

  // ── Credenciais salvas ───────────────────────────────────────────────────────
  sock.ev.on("creds.update", saveCreds);

  // ── Eventos de conexão ───────────────────────────────────────────────────────
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 Escaneie o QR Code abaixo com o WhatsApp do celular:\n");
      qrcode.generate(qr, { small: true });
      console.log("\n⏳ O QR Code expira em ~60 segundos. Se expirar, reinicie o bot.\n");
    }

    if (connection === "open") {
      reconectando = false;
      log("Conectado ao WhatsApp com sucesso!", "OK");

      // Listar grupos automaticamente se GROUP_JID não estiver configurado
      if (!config.GROUP_JID || config.GROUP_JID === "SEU_GROUP_JID_AQUI") {
        log(
          "GROUP_JID não configurado. Listando grupos disponíveis...",
          "AVISO"
        );
        await sleep(2000);
        await listarGrupos();
      } else {
        log(`Monitorando grupo: ${config.GROUP_JID}`, "INFO");
        iniciarAgendamentos();
      }
    }

    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error instanceof Boom
          ? lastDisconnect.error.output?.statusCode
          : 0;

      const deveReconectar = statusCode !== DisconnectReason.loggedOut;

      log(
        `Conexão encerrada. Código: ${statusCode} | Reconectar: ${deveReconectar}`,
        "AVISO"
      );

      if (deveReconectar && !reconectando) {
        reconectando = true;
        log("Tentando reconectar em 5 segundos...", "AVISO");
        await sleep(5000);
        conectar();
      } else if (!deveReconectar) {
        log(
          "Sessão encerrada (logout). Apague a pasta 'auth_info' e reinicie.",
          "ERRO"
        );
        process.exit(1);
      }
    }
  });

  // ── Mensagens recebidas (comandos de administração via chat) ─────────────────
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.key.fromMe) continue; // Só aceita comandos do próprio número
      const texto =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

      switch (texto.trim().toLowerCase()) {
        case "!abrir":
          log("Comando manual: abrir grupo", "INFO");
          await abrirGrupo();
          break;
        case "!fechar":
          log("Comando manual: fechar grupo", "INFO");
          await fecharGrupo();
          break;
        case "!grupos":
          log("Comando manual: listar grupos", "INFO");
          await listarGrupos();
          break;
        case "!status":
          await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Bot ativo!\n📅 Próximos agendamentos:\n• Quarta: Abre 08h | Fecha 17h\n• Sábado: Abre 08h | Fecha 12h\n🆔 Grupo: ${config.GROUP_JID}`,
          });
          break;
      }
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  ENTRADA
// ══════════════════════════════════════════════════════════════════════════════

(async () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   WhatsApp Grupo Bot — Agendador       ║");
  console.log("╚════════════════════════════════════════╝\n");

  if (!config.GROUP_JID || config.GROUP_JID === "SEU_GROUP_JID_AQUI") {
    log(
      "⚠️  Configure o GROUP_JID em config.js antes de usar o agendador.",
      "AVISO"
    );
    log(
      "   O bot vai conectar e listar seus grupos para você copiar o JID.",
      "INFO"
    );
  }

  await conectar();
})();
