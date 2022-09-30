/*
  Description: Clears all bans and ratelimits
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 10);
  }

  // remove arrest records
  server.police.clear();

  core.stats.set('users-banned', 0);
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick} 已解除所有封禁并重置频率限制器`,
  }, { level: UAC.isModerator });

  return true;
}
export function initHooks(server) {
  server.registerHook('in','chat',this.unbanallCheck.bind(this),24);
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function unbanallCheck(core,server,socket,payload){
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/unbanall')) {
    this.run(core, server, socket, {
        cmd: 'unbanall',
    });

    return false;
  }

  return payload;
}
export const info = {
  name: 'unbanall',
  description: '解除所有封禁并重置频率限制器',
  usage: `
    API: { cmd: 'unbanall' }
    文本：以聊天形式发送 /unbanall`,
};
