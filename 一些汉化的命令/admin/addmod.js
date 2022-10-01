/*
  Description: Adds the target trip to the mod list then elevates the uType
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

  // add new trip to config
  core.config.mods.push({ trip: data.trip });

  // find targets current connections
  const newMod = server.findSockets({ trip: data.trip });
  if (newMod.length !== 0) {
    for (let i = 0, l = newMod.length; i < l; i += 1) {
      // upgrade privilages
      newMod[i].uType = 'mod';
      newMod[i].level = UAC.levels.moderator;

      // inform new mod
      server.send({
        cmd: 'info',
        text: '您已成为管理员',
      }, newMod[i]);
    }
  }
  server.broadcast({
    cmd: 'info',
    text: `已添加管理员识别码：${data.trip}`,
  }, { level: UAC.isModerator });
  server.reply({
    cmd: 'info',
    text: `请执行 \`saveconfig\` 命令来让它永久有效`,
  }, socket);

  return true;
}
export function initHooks(server) {
  server.registerHook('in','chat',this.addmodCheck.bind(this));
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function addmodCheck(core,server,socket,payload){
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/addmod')) {
    const input = payload.text.split(' ');
    if (typeof input[1] !== 'string'){
      server.reply({
        cmd:'warn',
        text:'命令语法有误，请发送 `/help addmod` 来查看相关帮助。'
      },socket)
      return false
    }
    this.run(core, server, socket, {
        cmd: 'addmod',
        trip: input[1],
    });

    return false;
  }

  return payload;
}
export const requiredData = ['trip'];
export const info = {
  name: 'addmod',
  description: '添加一名管理员',
  usage: `
    API: { cmd: 'addmod', trip: '<target trip>' }
    文本：以聊天形式发送 /addmod 目标识别码`,
};
