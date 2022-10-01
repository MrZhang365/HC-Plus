/*
  Description: Forces a change on the target(s) socket's channel, then broadcasts event
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作。'
    },socket)
    return server.police.frisk(socket.address, 10);
  }

  // check user input
  if (typeof data.nick !== 'string') {
    if (typeof data.nick !== 'object' && !Array.isArray(data.nick)) {
      return true;
    }
  }

  let destChannel;
  if (typeof data.to === 'string' && !!data.to.trim()) {
    destChannel = data.to;
  } else {
    destChannel = Math.random().toString(36).substr(2, 8);
  }

  // find target user(s)
  const badClients = server.findSockets({ channel: socket.channel, nick: data.nick });

  if (badClients.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '找不到您指定的用户',
    }, socket);
  }

  // check if found targets are kickable, add them to the list if they are
  const kicked = [];
  for (let i = 0, j = badClients.length; i < j; i += 1) {
    if (badClients[i].level >= socket.level) {
      server.reply({
        cmd: 'warn',
        text: '不能踢同级别或级别更高的用户，多么粗鲁。',
      }, socket);
    } else {
      kicked.push(badClients[i]);
    }
  }

  if (kicked.length === 0) {
    return true;
  }

  // Announce the kicked clients arrival in destChannel and that they were kicked
  // Before they arrive, so they don't see they got moved
  for (let i = 0; i < kicked.length; i += 1) {
    server.broadcast({
      cmd: 'onlineAdd',
      nick: kicked[i].nick,
      trip: kicked[i].trip || '',
      hash: kicked[i].hash,
    }, { channel: destChannel });
  }

  // Move all kicked clients to the new channel
  for (let i = 0; i < kicked.length; i += 1) {
    kicked[i].channel = destChannel;

    server.broadcast({
      cmd: 'info',
      text: `${kicked[i].nick} 被踢到了 ?${destChannel}`,
    }, { channel: socket.channel, level: UAC.isModerator });
  }


  // broadcast client leave event
  for (let i = 0, j = kicked.length; i < j; i += 1) {
    server.broadcast({
      cmd: 'onlineRemove',
      nick: kicked[i].nick,
    }, { channel: socket.channel });
  }

  // publicly broadcast kick event
  server.broadcast({
    cmd: 'info',
    text: `已踢出 ${kicked.map((k) => k.nick).join(', ')}`,
  }, { channel: socket.channel, level: (level) => level < UAC.levels.moderator });

  // stats are fun
  core.stats.increment('users-kicked', kicked.length);

  return true;
}
export function initHooks(server) {
  server.registerHook('in','chat',this.kickCheck.bind(this));
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function kickCheck(core,server,socket,payload){
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/kick')) {
    const input = payload.text.split(' ');
    if (typeof input[1] !== 'string'){
      server.reply({
        cmd:'warn',
        text:'命令语法有误，请发送 `/help kick` 来查看相关帮助。'
      },socket)
      return false
    }
    this.run(core, server, socket, {
        cmd: 'kick',
        nick: input[1],
        to: input[2]
    });

    return false;
  }

  return payload;
}
export const requiredData = ['nick'];
export const info = {
  name: 'kick',
  description: '从你所在的聊天室内踢出用户（将指定的用户静默移动到指定或随机的房间）',
  usage: `
    API: { cmd: 'kick', nick: '<目标昵称，如果为数组则可以将N个用户踢到同一个房间>', to: '<用户的“目的地”>' }
    文本：以聊天形式发送 /kick 目标用户的昵称 用户的“目的地”`,
};
