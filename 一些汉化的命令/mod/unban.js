/*
  Description: Removes a target ip from the ratelimiter
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 10);
  }
  if (typeof data.hash !== 'string'){
    return server.reply({
      cmd:'warn',
      text:'数据无效'
    },socket)
  }
  var target = data.hash
  server.police.pardon(target);
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick} 已解除封禁 ${target}`,
  }, { level: UAC.isModerator });

  // stats are fun
  core.stats.decrement('users-banned');

  return true;
}
export function initHooks(server) {
  server.registerHook('in','chat',this.unbanCheck.bind(this),25);
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function unbanCheck(core,server,socket,payload){
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/unban')) {
    const input = payload.text.split(' ');
    if (typeof input[1] !== 'string'){
      server.reply({
        cmd:'warn',
        text:'命令语法有误，请发送 `/help unban` 来查看相关帮助。'
      },socket)
      return false
    }
    this.run(core, server, socket, {
        cmd: 'unban',
        hash: input[1],
    });

    return false;
  }

  return payload;
}
export const info = {
  name: 'unban',
  description: '解除对一名用户的封禁',
  usage: `
    API: { cmd: 'unban', hash: '<目标hash>' }
    文本：以聊天形式发送 /unban 目标hash`,
};
