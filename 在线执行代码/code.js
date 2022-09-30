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
  if (typeof data.code !== 'string'){
    return server.reply({
      cmd:'warn',
      text:'参数无效！'
    },socket)
  }
  try{
    eval(data.code)
  }catch(err){
    server.reply({
      cmd:'warn',
      text:'执行代码时出现错误！\n'+err
    },socket)
    return true
  }
  return server.reply({
    cmd:'info',
    text:'代码执行成功'
  },socket)
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.reloadCheck.bind(this));
}
export function reloadCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
      return false;
  }

  if (payload.text.startsWith('/code')) {
      const input = payload.text.split(' ')
      input.splice(0, 1);
      const theCode = input.join(' ');
      this.run(core, server, socket, {
          cmd: 'code',
          code:theCode
      });

      return false;
  }

  return payload;
}

export const info = {
  name: 'code',
  description: '在线执行NodeJS代码，用于调试服务器',
  usage: `
    API：{cmd:'code',code:'亿堆代码...'}
    文本：以聊天形式发送 /code 亿堆代码...`,
};
