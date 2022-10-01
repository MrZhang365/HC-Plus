/*
  Description: Writes the current config to disk
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isAdmin(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 20);
  }

  // attempt save, notify of failure
  if (!core.configManager.save()) {
    return server.reply({
      cmd: 'warn',
      text: '无法保存配置文件，请检查日志！',
    }, socket);
  }

  // return success message to moderators and admins
  server.broadcast({
    cmd: 'info',
    text: '已保存配置文件！',
  }, { level: UAC.isModerator });

  return true;
}
export function initHooks(server) {
  server.registerHook('in','chat',this.saveconfigCheck.bind(this));
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function saveconfigCheck(core,server,socket,payload){
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/saveconfig')) {
    this.run(core, server, socket, {
        cmd: 'saveconfig',
    });

    return false;
  }

  return payload;
}
export const info = {
  name: 'saveconfig',
  description: '将服务器当前的配置写入到文件里',
  usage: `
    API: { cmd: 'saveconfig' }
    文本：以聊天形式发送 /saveconfig`,
};
