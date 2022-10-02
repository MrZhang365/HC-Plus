/*
  Description: Outputs the current command module list or command categories
*/

// module main
export async function run(core, server, socket, payload) {
  // check for spam
  if (server.police.frisk(socket.address, 2)) {
    return server.reply({
      cmd: 'warn',
      text: '您发送信息的速度太快了，请稍后再试。\n按下向上按钮即可恢复刚刚的信息。',
    }, socket);
  }

  // verify user input
  if (typeof payload.command !== 'undefined' && typeof payload.command !== 'string') {
    return true;
  }

  let reply = '';
  if (typeof payload.command === 'undefined') {
    reply += '# 所有命令\n|分类：|名称：|\n|---:|---|\n';

    const categories = core.commands.categoriesList.sort();
    for (let i = 0, j = categories.length; i < j; i += 1) {
      reply += `|${categories[i].replace('../src/commands/', '').replace(/^\w/, (c) => c.toUpperCase())}:|`;
      const catCommands = core.commands.all(categories[i]).sort((a, b) => a.info.name.localeCompare(b.info.name));
      reply += `${catCommands.map((c) => `${c.info.name}`).join(', ')}|\n`;
    }

    reply += '---\n要查看指定命令的帮助，请：\n以聊天形式发送：/help 命令名称\nAPI: `{cmd: \'help\', command: \'<command name>\'}`';
  } else {
    const command = core.commands.get(payload.command);

    if (typeof command === 'undefined') {
      reply += '未知的命令';
    } else {
      reply += `# ${command.info.name} 命令：\n| | |\n|---:|---|\n`;
      reply += `|**名称：**|${command.info.name}|\n`;
      reply += `|**别名：**|${typeof command.info.aliases !== 'undefined' ? command.info.aliases.join(', ') : '¯\\\\\\_(ツ)\\_/¯ 啥也没有'}|\n`;
      reply += `|**分类：**|${command.info.category.replace('../src/commands/', '').replace(/^\w/, (c) => c.toUpperCase())}|\n`;
      reply += `|**必要参数**|${command.requiredData || '¯\\\\\\_(ツ)\\_/¯ 啥也没有'}|\n`;
      reply += `|**说明**|${command.info.description || '¯\\\\\\_(ツ)\\_/¯ 啥也没有'}|\n\n`;
      reply += `**用法：** ${command.info.usage || '¯\\\\\\_(ツ)\\_/¯ 啥也没有'}`;
    }
  }

  // output reply
  server.reply({
    cmd: 'info',
    text: reply,
  }, socket);

  return true;
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.helpCheck.bind(this), 28);
}

// hooks chat commands checking for /whisper
export function helpCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/help')) {
    const input = payload.text.substr(1).split(' ', 2);

    this.run(core, server, socket, {
      cmd: input[0],
      command: input[1],
    });

    return false;
  }

  return payload;
}

export const info = {
  name: 'help',
  description: '显示所有可用的命令，或者显示指定命令的帮助',
  usage: `
    API: { cmd: 'help', command: '<optional command name>' }
    文本：以聊天形式发送 /help 命令名称（可选）`,
};
