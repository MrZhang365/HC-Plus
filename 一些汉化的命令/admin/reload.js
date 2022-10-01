/*
  Description: Clears and resets the command modules, outputting any errors
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

  // do command reload and store results
  let loadResult = core.dynamicImports.reloadDirCache();
  loadResult += core.commands.loadCommands();

  // clear and rebuild all module hooks
  server.loadHooks();

  // build reply based on reload results
  if (loadResult === '') {
    loadResult = `已重新加载 ${core.commands.commands.length} 个命令，没有出现错误。`;
  } else {
    loadResult = `已重新加载 ${core.commands.commands.length} 个命令，但是出现了以下错误：
      ${loadResult}`;
  }

  if (typeof data.reason !== 'undefined') {
    loadResult += `\n原因： ${data.reason}`;
  }

  // send results to moderators (which the user using this command is higher than)
  server.broadcast({
    cmd: 'info',
    text: loadResult,
  }, { level: UAC.isModerator });

  return true;
}
export function initHooks(server) {
  server.registerHook('in','chat',this.reloadCheck.bind(this));
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function reloadCheck(core,server,socket,payload){
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/reload')) {
    const input = payload.text.split(' ');
    this.run(core, server, socket, {
        cmd: 'reload',
        reason: input[1],
    });

    return false;
  }

  return payload;
}
export const info = {
  name: 'reload',
  description: '更新服务器',
  usage: `
    API: { cmd: 'reload', reason: '<optional reason append>' }
    文本：以聊天形式发送 /reload 可选的原因`,
};
