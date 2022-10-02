/*
  Description: Rebroadcasts any `text` to all clients in a `channel`
*/

import * as UAC from '../utility/UAC/_info';

// module support functions
const parseText = (text) => {
  // verifies user input is text
  if (typeof text !== 'string') {
    return false;
  }

  let sanitizedText = text;

  // strip newlines from beginning and end
  sanitizedText = sanitizedText.replace(/^\s*\n|^\s+$|\n\s*$/g, '');
  // replace 3+ newlines with just 2 newlines
  sanitizedText = sanitizedText.replace(/\n{3,}/g, '\n\n');

  return sanitizedText;
};

// module main
export async function run(core, server, socket, data) {
  // check user input
  const text = parseText(data.text);

  if (!text) {
    // lets not send objects or empty text, yea?
    return server.police.frisk(socket.address, 13);
  }

  // check for spam
  const score = text.length / 83 / 4;
  if (server.police.frisk(socket.address, score)) {
    return server.reply({
      cmd: 'warn',
      text: '您发送信息的速度太快了，请稍后再试。\n按下向上按钮即可恢复刚刚的信息。',
    }, socket);
  }

  // build chat payload
  const payload = {
    cmd: 'chat',
    nick: socket.nick,
    text,
    level: socket.level,
  };

  if (UAC.isAdmin(socket.level)) {
    payload.admin = true;
  } else if (UAC.isModerator(socket.level)) {
    payload.mod = true;
  }

  if (socket.trip) {
    payload.trip = socket.trip;
  }

  // broadcast to channel peers
  server.broadcast(payload, { channel: socket.channel });

  // stats are fun
  core.stats.increment('messages-sent');

  return true;
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.commandCheckIn.bind(this), 20);
  server.registerHook('in', 'chat', this.finalCmdCheck.bind(this), 254);
}

// checks for miscellaneous '/' based commands
export function commandCheckIn(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/myhash')) {
    server.reply({
      cmd: 'info',
      text: `你的hash为：${socket.hash}`,
    }, socket);
    return false;
  }else if (payload.text.startsWith('/shrug')){
    this.run(core,server,socket,{
      cmd:'chat',
      text:'¯\\\\\\_(ツ)\\_/¯'
    })
    return false
  }
  return payload;
}

export function finalCmdCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (!payload.text.startsWith('/')) {
    return payload;
  }

  if (payload.text.startsWith('//')) {
    payload.text = payload.text.substr(1);

    return payload;
  }

  server.reply({
    cmd: 'warn',
    text: `未知的命令：${payload.text}`,
  }, socket);

  return false;
}

export const requiredData = ['text'];
export const info = {
  name: 'chat',
  description: '发送信息。如果你不打算制作客户端，请忽略这个命令。',
  usage: `
    API: { cmd: 'chat', text: '<text to send>' }
    超级隐藏命令：
    /myhash`,
};
