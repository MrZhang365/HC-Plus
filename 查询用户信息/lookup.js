import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  const badClients = server.findSockets({ channel: socket.channel, nick: data.nick });
  if (badClients.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '不能在聊天室找到用户',
    }, socket);
  }
  const targetClient = badClients[0];
  server.reply({
    cmd:'info',
    text:`${targetClient.nick} 的信息：
昵称：${targetClient.nick}
hash：${targetClient.hash}
识别码：${targetClient.trip || ''}
用户类型：${targetClient.uType}
等级：${targetClient.level}`,
  },socket)
}
export function initHooks(server) {
  server.registerHook('in', 'chat', this.lookupCheck.bind(this),20);
}

// hooks chat commands checking for /nick
export function lookupCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
      return false;
  }

  if (payload.text.startsWith('/lookup')) {
      const input = payload.text.split(' ');

      // If there is no nickname target parameter
      if (input[1] === undefined) {
          server.reply({
              cmd: 'warn',
              text: '命令格式有误，请发送 `/help lookup` 来查看帮助',
          }, socket);

          return false;
      }

      this.run(core, server, socket, {
          cmd: 'lookup',
          nick: input[1],
      });

      return false;
  }

  return payload;
}
export const requiredData = ['nick'];
export const info = {
  name: 'lookup',
  description: '查找某名用户的信息',
  usage: `
    API: { cmd: 'lookup' nick: '<目标昵称>'}
    文本：以聊天形式发送 /lookup 目标昵称`,
};