/*
  这个命令用于显示所有mod
  这个命令由小张软件总程序员Mr_Zhang编写
  这些代码是开源的，除十字街外，其他聊天室都可以使用
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
    // increase rate limit chance and ignore if not admin
    if (!UAC.isAdmin(socket.level)) {
        server.reply({
            cmd:'warn',
            text:'抱歉，您的权限不足，无法执行此操作。'
        },socket)
        return server.police.frisk(socket.address, 20);
    }
    var content = '以下是所有模组（Mod）：\n'
    for (var i = 0; i < core.config.mods.length; i++) {
        content = content+`${core.config.mods[i].trip}\n`
    }

    server.reply({
        cmd: 'info',
        text: content,
    }, socket);

    return true;
}

// module hook functions
export function initHooks(server) {
    server.registerHook('in', 'chat', this.modlistCheck.bind(this), 21);
  }
  
  // hooks chat commands checking for /nick
  export function modlistCheck(core, server, socket, payload) {
    if (typeof payload.text !== 'string') {
        return false;
    }
  
    if (payload.text.startsWith('/modlist')) {
 
        this.run(core, server, socket, {
            cmd: 'modlist',
        });
  
        return false;
    }
  
    return payload;
  }

export const info = {
    name: 'modlist',
    description: '查看所有模组（Mod）',
    usage: `
    API: { cmd: 'modlist' }
    文本：以聊天形式发送 /modist`,
};
