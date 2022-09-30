/*
  Description: Clears and resets the command modules, outputting any errors
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isAdmin(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 20);
  }
  if (typeof data.command !== 'string'){
    return true
  }
  if (core.commands.commands.filter((cmd) => cmd.info.name == data.command).length == 0){
    return server.reply({
      cmd:'warn',
      text:'找不到您要移除的命令！'
    },socket)
  }
  if (data.command == 'reload'){
    return server.reply({
      cmd:'warn',
      text:'哥们儿！什么命令都可以移除，唯独reload命令不能移除！！！'
    },socket)
  }
  core.commands.commands = core.commands.commands.filter((cmd) => cmd.info.name !== data.command)
  server.loadHooks()
  // send results to moderators (which the user using this command is higher than)
  server.broadcast({
    cmd: 'info',
    text: `已移除 ${data.command} 命令`,
  }, {});
  server.reply({
    cmd:'info',
    text:`您可以执行 \`reload\` 命令来恢复被移除的命令。`
  },socket)
  return true;
}
export function initHooks(server) {
  server.registerHook('in', 'chat', this.reloadCheck.bind(this));
}

export function reloadCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
      return false;
  }

  if (payload.text.startsWith('/removecmd')) {
      const input = payload.text.split(' ');
      this.run(core, server, socket, {
          cmd: 'removecmd',
          command: input[1],
      });

      return false;
  }

  return payload;
}

export const info = {
  name: 'removecmd',
  description: '从内存中移除一个命令',
  usage: `==提醒：请不要移除reload命令，否则会导致无法恢复被移除的命令，届时您只能通过手动重启服务器来恢复命令！==
    API: { cmd: 'removecmd', command: '<目标命令的名称>' }
    文本：以聊天形式发送 /removecmd 目标命令的名称`,
};
