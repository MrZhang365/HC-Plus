import * as UAC from '../utility/UAC/_info';

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
      text: '找不到这个用户',
    }, socket);
  }

  [badClient] = badClient;

  // i guess banning mods or admins isn't the best idea?
  if (badClient.level >= socket.level) {
    return server.reply({
      cmd: 'warn',
      text: '不能强制同级别或级别更高的用户下线',
    }, socket);
  }
  // notify normal users
  server.broadcast({
    cmd: 'info',
    text: `已强制 ${targetNick} 下线`,
    user: UAC.getUserDetails(badClient),
  }, { channel: socket.channel });
  // force connection closed
  badClient.terminate();
  return true;
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.offlineCheck.bind(this));
}

// hooks chat commands checking for /nick
export function offlineCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
      return false;
  }

  if (payload.text.startsWith('/offline')) {
      const input = payload.text.split(' ');

      // If there is no nickname target parameter
      if (input[1] === undefined) {
          server.reply({
              cmd: 'warn',
              text: '命令格式有误，请发送 `/help offline` 来查看帮助',
          }, socket);

          return false;
      }


      this.run(core, server, socket, {
          cmd: 'offline',
          nick: input[1],
      });

      return false;
  }

  return payload;
}

export const requiredData = ['nick'];
export const info = {
  name: 'offline',
  description: '该命令用于强制某用户下线。',
  usage: `
    API: { cmd: 'offline', nick: '<目标用户>' }`,
};
