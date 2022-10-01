/*
  Description: Emmits a server-wide message as `info`
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

  // send text to all channels
  server.broadcast({
    cmd: 'info',
    text: `站长通知：${data.text}`,
  }, {});

  return true;
}
export function initHooks(server) {
  server.registerHook('in', 'chat', this.shoutCheck.bind(this), 30);
}

// hooks chat commands checking for /me
export function shoutCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/shout')) {
    const input = payload.text.split(' ');

    // If there is no shout target parameter
    if (input[1] === undefined) {
      server.reply({
        cmd: 'warn',
        text: '命令格式有误，请发送 `/help shout` 来查看帮助',
      }, socket);

      return false;
    }

    input.splice(0, 1);
    const shoutText = input.join(' ');

    this.run(core, server, socket, {
      cmd: 'shout',
      text: shoutText,
    });

    return false;
  }

  return payload;
}
export const requiredData = ['text'];
export const info = {
  name: 'shout',
  description: '向所有在线的用户发送一条通知',
  usage: `
    API: { cmd: 'shout', text: '<shout text>' }
    文本：以聊天形式发送 /shout 信息`,
};
