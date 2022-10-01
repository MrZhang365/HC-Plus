/*
  Description: Removes target trip from the config as a mod and downgrades the socket type
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isAdmin(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 20);
  }

  // remove trip from config
  core.config.mods = core.config.mods.filter((mod) => mod.trip !== data.trip);

  // find targets current connections
  const targetMod = server.findSockets({ trip: data.trip });
  if (targetMod.length !== 0) {
    for (let i = 0, l = targetMod.length; i < l; i += 1) {
      // downgrade privilages
      targetMod[i].uType = 'user';
      targetMod[i].level = UAC.levels.default;

      // inform ex-mod
      server.send({
        cmd: 'info',
        text: '您的管理员身份被删除',
      }, targetMod[i]);
    }
  }
  server.broadcast({
    cmd: 'info',
    text: `已移除管理员识别码：${data.trip}`,
  }, { level: UAC.isModerator });
  server.reply({
    cmd:'info',
    text:'请执行 `saveconfig` 命令来使它永久有效'
  },socket)
  return true;
}
export function initHooks(server) {
  server.registerHook('in','chat',this.removemodCheck.bind(this));
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function removemodCheck(core,server,socket,payload){
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/removemod')) {
    const input = payload.text.split(' ');
    if (typeof input[1] !== 'string'){
      server.reply({
        cmd:'warn',
        text:'命令语法有误，请发送 `/help removemod` 来查看相关帮助。'
      },socket)
      return false
    }
    this.run(core, server, socket, {
        cmd: 'removemod',
        trip: input[1],
    });

    return false;
  }

  return payload;
}
export const requiredData = ['trip'];
export const info = {
  name: 'removemod',
  description: '移除一名管理员',
  usage: `
    API: { cmd: 'removemod', trip: '<target trip>' }
    文本：以聊天形式发送 /removemod 目标管理员的识别码`,
};
