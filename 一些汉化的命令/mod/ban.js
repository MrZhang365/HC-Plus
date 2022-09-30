/*
  说明：封禁一名用户
*/

import * as UAC from '../utility/UAC/_info';

// 主函数
export async function run(core, server, socket, data) {
  // 你是管理员吗？
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 10);
  }

  // check user input
  if (typeof data.nick !== 'string') {
    return true;
  }

  // find target user
  const targetNick = data.nick;
  let badClient = server.findSockets({ channel: socket.channel, nick: targetNick });

  if (badClient.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '抱歉，找不到那位~~（倒霉的）~~用户。',
    }, socket);
  }

  [badClient] = badClient;

  // i guess banning mods or admins isn't the best idea?
  if (badClient.level >= socket.level) {
    return server.reply({
      cmd: 'warn',
      text: '自相残杀很刺激，但是也很危险，不是吗？',
    }, socket);
  }

  // commit arrest record
  server.police.arrest(badClient.address, badClient.hash);
  // notify normal users
  server.broadcast({
    cmd: 'info',
    text: `已封禁 ${targetNick}`,
    user: UAC.getUserDetails(badClient),
  }, { channel: socket.channel, level: (level) => level < UAC.levels.moderator });

  // notify mods
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick} 在 ?${socket.channel} 封禁了 ${targetNick}\n被封禁的用户的hash为：${badClient.hash}`,
    user: UAC.getUserDetails(badClient),
    banner: UAC.getUserDetails(socket),
  }, { level: UAC.isModerator });

  // force connection closed
  badClient.terminate();

  // stats are fun
  core.stats.increment('users-banned');

  return true;
}
export function initHooks(server) {
  server.registerHook('in','chat',this.banCheck.bind(this));
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function banCheck(core,server,socket,payload){
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/ban')) {
    const input = payload.text.split(' ');
    if (typeof input[1] !== 'string'){
      server.reply({
        cmd:'warn',
        text:'命令语法有误，请发送 `/help ban` 来查看相关帮助。'
      },socket)
      return false
    }
    this.run(core, server, socket, {
        cmd: 'ban',
        nick: input[1],
    });

    return false;
  }

  return payload;
}
export const requiredData = ['nick'];
export const info = {
  name: 'ban',
  description: '封禁一名用户',
  usage: `
    API: { cmd: 'ban', nick: '<target nickname>' }
    文本：以聊天形式发送 /ban 目标昵称`,
};
