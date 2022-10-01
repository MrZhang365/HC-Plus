/*
  Description: Removes the target socket from the current channel and forces a join event in another
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
  if (typeof data.nick !== 'string' || typeof data.channel !== 'string') {
    return true;
  }

  if (data.channel === socket.channel) {
    // moving them into the same channel? y u do this?
    return true;
  }

  const badClients = server.findSockets({ channel: socket.channel, nick: data.nick });

  if (badClients.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '找不到这个用户',
    }, socket);
  }

  const badClient = badClients[0];

  if (badClient.level >= socket.level) {
    return server.reply({
      cmd: 'warn',
      text: '自相残杀不被允许！',
    }, socket);
  }

  const currentNick = badClient.nick.toLowerCase();
  const userExists = server.findSockets({
    channel: data.channel,
    nick: (targetNick) => targetNick.toLowerCase() === currentNick,
  });

  if (userExists.length > 0) {
    server.reply({
      cmd:'warn',
      text:'无法移动这位用户，因为目标房间内已经有人使用了这个昵称了'
    })
    // That nickname is already in that channel
    return true;
  }

  const peerList = server.findSockets({ channel: socket.channel });

  if (peerList.length > 1) {
    for (let i = 0, l = peerList.length; i < l; i += 1) {
      server.reply({
        cmd: 'onlineRemove',
        nick: peerList[i].nick,
      }, badClient);

      if (badClient.nick !== peerList[i].nick) {
        server.reply({
          cmd: 'onlineRemove',
          nick: badClient.nick,
        }, peerList[i]);
      }
    }
  }

  // TODO: import from join module
  const newPeerList = server.findSockets({ channel: data.channel });
  const moveAnnouncement = {
    cmd: 'onlineAdd',
    nick: badClient.nick,
    trip: badClient.trip || '',
    hash: server.getSocketHash(badClient),
  };
  const nicks = [];

  for (let i = 0, l = newPeerList.length; i < l; i += 1) {
    server.reply(moveAnnouncement, newPeerList[i]);
    nicks.push(newPeerList[i].nick);
  }

  nicks.push(badClient.nick);

  server.reply({
    cmd: 'onlineSet',
    nicks,
  }, badClient);

  badClient.channel = data.channel;

  server.broadcast({
    cmd: 'info',
    text: `${badClient.nick} 被强制移入到了 ?${data.channel}`,
  }, { channel: data.channel });

  return true;
}
export function initHooks(server) {
  server.registerHook('in','chat',this.moveuserCheck.bind(this));
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function moveuserCheck(core,server,socket,payload){
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/moveuser')) {
    const input = payload.text.split(' ');
    if (typeof input[1] !== 'string'){
      server.reply({
        cmd:'warn',
        text:'命令语法有误，请发送 `/help moveuser` 来查看相关帮助。'
      },socket)
      return false
    }
    if (typeof input[2] !== 'string'){
      server.reply({
        cmd:'warn',
        text:'命令语法有误，请发送 `/help moveuser` 来查看相关帮助。'
      },socket)
      return false
    }
    this.run(core, server, socket, {
        cmd: 'moveuser',
        nick: input[1],
        channel: input[2]
    });

    return false;
  }

  return payload;
}
export const requiredData = ['nick', 'channel'];
export const info = {
  name: 'moveuser',
  description: '将某用户正常移动到其他房间',
  usage: `
    API: { cmd: 'moveuser', nick: '<target nick>', channel: '<new channel>' }
    文本：以聊天形式发送 /moveuser 目标昵称 新的房间`,
};
