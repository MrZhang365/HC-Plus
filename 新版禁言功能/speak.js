/*
 * Description: Pardon a dumb user to be able to speak again
 * Author: simple
 */

import * as UAC from '../utility/UAC/_info';

// module constructor
export function init(core) {
  if (typeof core.muzzledHashes === 'undefined') {
    core.mute = {};
  }
}

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法执行此操作。'
    },socket);
    return server.police.frisk(socket.address, 10);
  }

  // check user input
  if (typeof data.ip !== 'string' && typeof data.hash !== 'string') {
    return server.reply({
      cmd: 'warn',
      text: "参数错误",
    }, socket);
  }
  if (typeof data.hash !== 'string'){
    return true
  }
  if (data.hash === '*') {
    core.mute = {};
    server.broadcast({
      cmd:'info',
      text:'已解除所有禁言',
    },{level: (level) => level < UAC.levels.moderator});
    return server.broadcast({
      cmd: 'info',
      text: `${socket.nick} 解除了所有禁言`,
    }, { level: UAC.isModerator });
  }

  core.mute[data.hash] = undefined;

  // notify mods
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}已解除对hash ${data.hash} 的禁言。`,
  }, { level: UAC.isModerator });
  server.broadcast({
    cmd:'info',
    text:`你的禁言已被手动解除。`
  },{hash:data.hash})

  return true;
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.speakCheck.bind(this),9);  //优先级设为9是为了在调试期间方便给自己解除禁言（DOGE
}

// hooks chat commands checking for /nick
export function speakCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
      return false;
  }

  if (payload.text.startsWith('/speak')) {
      const input = payload.text.split(' ');

      // If there is no nickname target parameter
      if (input[1] === undefined) {
          server.reply({
              cmd: 'warn',
              text: '语法错误，请发送 `/help speak` 来查看使用方法。',
          }, socket);

          return false;
      }


      this.run(core, server, socket, {
          cmd: 'speak',
          hash: input[1],
      });

      return false;
  }

  return payload;
}

export const info = {
  name: 'speak',
  description: '解除对某用户的禁言',
  usage: `
    API: { cmd: 'speak', hash: '<目标hash>' }
    文本：以聊天形式发送 /speak 目标hash ==（不是昵称！！！）==`,
};
info.aliases = ['unmuzzle', 'unmute'];
