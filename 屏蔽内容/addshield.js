import * as UAC from '../utility/UAC/_info';
export function init(core){
  if (!core.config.shield){
    core.config.shield = []
  }
}
// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作'
    },socket)
    return server.police.frisk(socket.address, 10);
  }
  if (typeof data.text !== 'string'){
    return server.reply({
      cmd:'warn',
      text:'数据无效'
    },socket)
  }
  if (!data.text){
    return server.reply({
      cmd:'warn',
      text:'数据无效'
    },socket)
  }
  if (core.config.shield.indexOf(data.text) !== -1){
    return server.reply({
      cmd:'warn',
      text:'该内容已经被屏蔽了，无需重复操作！'
    },socket)
  }
  core.config.shield.push(data.text)
  server.broadcast({
    cmd:'info',
    text:`已屏蔽所有包含 ${data.text} 的内容`
  },{level:(level) => level < UAC.levels.moderator})
  server.broadcast({
    cmd:'info',
    text:`${socket.nick} 已屏蔽所有包含 ${data.text} 的内容`
  },{level:UAC.isModerator})
  return true;
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.addshieldCheck.bind(this));
  server.registerHook('in', 'chat', this.fuckCheck.bind(this),10);
  server.registerHook('in', 'emote', this.fuckCheck.bind(this),10);
  server.registerHook('in', 'whisper', this.fuckCheck.bind(this),10);
  server.registerHook('in', 'shout', this.fuckCheck.bind(this),10);
  server.registerHook('in', 'join', this.fuckNick.bind(this),10);
  server.registerHook('in', 'changenick', this.fuckNick.bind(this),10);
}
export function fuckNick(core,server,socket,payload){
  if (typeof payload.nick !== 'string' || !payload.nick){
    return payload
  }
  var i = 0;
  for (i in core.config.shield){
    if (payload.nick.toLowerCase().indexOf(core.config.shield[i].toLowerCase()) !== -1){
      server.reply({
        cmd:'warn',
        text:`“${core.config.shield[i]}” 已被屏蔽，因此您无法继续操作。`
      },socket)
      return false
    }
  }
  return payload
}
export function fuckCheck(core,server,socket,payload){
  if (typeof payload.text !== 'string' || !payload.text){
    return payload
  }
  var i = 0;
  for (i in core.config.shield){
    if (payload.text.toLowerCase().indexOf(core.config.shield[i].toLowerCase()) !== -1){
      server.reply({
        cmd:'warn',
        text:`“${core.config.shield[i]}” 已被屏蔽，因此您无法发送这条信息。`
      },socket)
      return false
    }
  }
  return payload
}
// hooks chat commands checking for /nick
export function addshieldCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
      return false;
  }

  if (payload.text.startsWith('/addshield')) {
      const input = payload.text.split(' ');

      // If there is no nickname target parameter
      if (input[1] === undefined) {
          server.reply({
              cmd: 'warn',
              text: '命令格式有误，请发送 `/help addshield` 来查看帮助',
          }, socket);

          return false;
      }


      this.run(core, server, socket, {
          cmd: 'addshield',
          text: input[1],
      });

      return false;
  }

  return payload;
}

export const requiredData = ['text'];
export const info = {
  name: 'addshield',
  description: '该命令用于添加屏蔽的内容。',
  usage: `
    API: { cmd: 'addshield', text: '<要屏蔽的内容>' }
    文本：以聊天形式发送 /addshield 要屏蔽的内容`,
};
