/*
  Description: Outputs all current channels and their user nicks
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

  // find all users currently in a channel
  const currentUsers = server.findSockets({
    channel: (channel) => true,
  });

  // compile channel and user list
  const channels = {};
  for (let i = 0, j = currentUsers.length; i < j; i += 1) {
    if (typeof channels[currentUsers[i].channel] === 'undefined') {
      channels[currentUsers[i].channel] = [];
    }

    channels[currentUsers[i].channel].push(
      `[${currentUsers[i].trip || '无识别码'}]${currentUsers[i].nick}`,
    );
  }

  // build output
  const lines = [];
  for (const channel in channels) {
    lines.push(`?${channel} ${channels[channel].join(', ')}`);
  }

  // send reply
  server.reply({
    cmd: 'info',
    text: '所有在线的用户：\n'+lines.join('\n'),
  }, socket);

  return true;
}
export function initHooks(server) {
  server.registerHook('in','chat',this.listusersCheck.bind(this));
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function listusersCheck(core,server,socket,payload){
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/listusers')) {
    this.run(core, server, socket, {
        cmd: 'listusers',
    });

    return false;
  }

  return payload;
}
export const info = {
  name: 'listusers',
  description: '列出所有在线的用户',
  usage: `
    API: { cmd: 'listusers' }
    文本：以聊天形式发送 /listusers`,
};
