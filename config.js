// ══════════════════════════════════════════════════════════════════════════════
//  CONFIGURAÇÕES DO BOT
//  Edite este arquivo conforme as suas necessidades
// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // ─── JID do grupo alvo ──────────────────────────────────────────────────────
  // Formato: "1234567890-1234567890@g.us"
  // Para descobrir o JID, deixe em branco, inicie o bot e envie o comando !grupos
  GROUP_JID: "SEU_GROUP_JID_AQUI",

  // ─── Fuso horário ───────────────────────────────────────────────────────────
  // Use o nome TZ do IANA: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  // Exemplos brasileiros:
  //   "America/Sao_Paulo"   → Brasília / SP / RJ / MG (UTC-3 / UTC-2 no verão)
  //   "America/Manaus"      → AM / RO (UTC-4)
  //   "America/Belem"       → PA / MA / PI (UTC-3, sem horário de verão)
  //   "America/Bahia"       → BA (UTC-3, sem horário de verão)
  TIMEZONE: "America/Bahia",

  // ─── Mensagens ──────────────────────────────────────────────────────────────
  MSG_ABERTURA:
    "Bom dia! O grupo está sendo aberto agora, podem enviar as agendas.",

  MSG_FECHAMENTO:
    "🔒 Atenção: O grupo foi fechado. Caso não tenha conseguido postar a agenda dentro do horário estipulado, envie-a com a devida justificativa do atraso para os seguintes e-mails: weslei.proterra@gmail.com, edsonalexandrino.proterra@gmail.com e ronaldo.proterra@gmail.com.",

  // ─── Caminhos de arquivo (não precisa alterar) ──────────────────────────────
  AUTH_DIR: "./auth_info",         // Pasta onde a sessão do WhatsApp é salva
  STORE_FILE: "./store.json",      // Cache local de mensagens/contatos
};
