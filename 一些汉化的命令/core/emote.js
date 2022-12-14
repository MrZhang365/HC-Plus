/*
  Description: Broadcasts an emote to the current channel
*/

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
  let text = parseText(payload.text);

  if (!text) {
    // lets not send objects or empty text, yea?
    return server.police.frisk(socket.address, 8);
  }

  // check for spam
  const score = text.length / 83 / 4;
  if (server.police.frisk(socket.address, score)) {
    return server.reply({
      cmd: 'warn',
      text: '您发送信息的速度太快了，请稍后再试。\n按下向上按钮即可恢复刚刚的信息。',
    }, socket);
  }

  if (!text.startsWith("'")) {
    text = ` ${text}`;
  }

  const newPayload = {
    cmd: 'info',
    type: 'emote',
    nick: socket.nick,
    text: `@${socket.nick}${text}`,
  };
  if (socket.trip) {
    newPayload.trip = socket.trip;
  }

  // broadcast to channel peers
  server.broadcast(newPayload, { channel: socket.channel });

  return true;
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.emoteCheck.bind(this), 30);
}

// hooks chat commands checking for /me
export function emoteCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/me ')) {
    const input = payload.text.split(' ');

    // If there is no emote target parameter
    if (input[1] === undefined) {
      server.reply({
        cmd: 'warn',
        text: '命令格式有误，请发送 `/help emote` 来查看帮助',
      }, socket);

      return false;
    }

    input.splice(0, 1);
    const actionText = input.join(' ');

    this.run(core, server, socket, {
      cmd: 'emote',
      text: actionText,
    });

    return false;
  }

  return payload;
}

export const requiredData = ['text'];
export const info = {
  name: 'emote',
  description: '以第三人称发布自己的状态',
  usage: `
    API: { cmd: 'emote', text: '<emote/action text>' }
    文本：以聊天形式发送 /me 文本`,
};
