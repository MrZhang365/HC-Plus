/*
  Description: Display text on targets screen that only they can see
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
export async function run(core, server, socket, payload) {
  // check user input
  const text = parseText(payload.text);

  if (!text) {
    // lets not send objects or empty text, yea?
    return server.police.frisk(socket.address, 13);
  }

  // check for spam
  const score = text.length / 83 / 4;
  if (server.police.frisk(socket.address, score)) {
    return server.reply({
      cmd: 'warn',
      text: '你发送信息的速度过快，请稍后再试。\n按下向上按钮即可恢复上一条信息。',
    }, socket);
  }

  const targetNick = payload.nick;
  if (!UAC.verifyNickname(targetNick)) {
    return true;
  }

  // find target user
  let targetClient = server.findSockets({ channel: socket.channel, nick: targetNick });

  if (targetClient.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '找不到该用户',
    }, socket);
  }

  [targetClient] = targetClient;

  server.reply({
    cmd: 'info',
    type: 'whisper',
    from: socket.nick,
    trip: socket.trip || '',
    msg:text,
    text: `${socket.nick} 向你发送私信：${text}`,
  }, targetClient);

  targetClient.whisperReply = socket.nick;

  server.reply({
    cmd: 'info',
    type: 'whisper',
    text: `你向 @${targetNick}发送私信：${text}`,
  }, socket);

  return true;
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.whisperCheck.bind(this), 20);
}

// hooks chat commands checking for /whisper
export function whisperCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/whisper') || payload.text.startsWith('/w ')) {
    const input = payload.text.split(' ');

    // If there is no nickname target parameter
    if (input[1] === undefined) {
      server.reply({
        cmd: 'warn',
        text: '命令格式有误，请发送 `/help whisper` 来查看帮助',
      }, socket);

      return false;
    }

    const target = input[1].replace(/@/g, '');
    input.splice(0, 2);
    const whisperText = input.join(' ');

    this.run(core, server, socket, {
      cmd: 'whisper',
      nick: target,
      text: whisperText,
    });

    return false;
  }

  if (payload.text.startsWith('/r ')) {
    if (typeof socket.whisperReply === 'undefined') {
      server.reply({
        cmd: 'warn',
        text: '找不到需要回复的人',
      }, socket);

      return false;
    }

    const input = payload.text.split(' ');
    input.splice(0, 1);
    const whisperText = input.join(' ');

    this.run(core, server, socket, {
      cmd: 'whisper',
      nick: socket.whisperReply,
      text: whisperText,
    });

    return false;
  }

  return payload;
}

export const requiredData = ['nick', 'text'];
export const info = {
  name: 'whisper',
  description: '向某人发送私信',
  usage: `
    API: { cmd: 'whisper', nick: '<target name>', text: '<text to whisper>' }
    文本：以聊天形式发送 /whisper 目标用户的昵称 要发送的信息
    或者以聊天形式发送 /w 目标用户的昵称 要发送的信息
    快速回复上一个私信你的人：以聊天形式发送 /r 要回复的信息`,
};
