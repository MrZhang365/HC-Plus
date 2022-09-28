/*
  此命令用于取消替换识别码
*/

import * as UAC from '../utility/UAC/_info';
export async function init(core){
  if (core.config.trips===undefined){
    core.config.trips=[]
  }
}
// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isAdmin(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作。'
    },socket)
    return server.police.frisk(socket.address, 20);
  }
  var had=false
  var new_list=[]
  for (var i=0; i<core.config.trips.length; i++) {
    if (core.config.trips[i].new_trip === data.trip){
      had=true
    }else{
      new_list.push(core.config.trips[i])
    }
  }
  if (!had){
    return server.reply({
      cmd:'warn',
      text:'找不到目标识别码'
    },socket)
  }
  core.config.trips=new_list

  // find targets current connections
  server.broadcast({
    cmd:'info',
    text:`你的识别码已被取消替换\n重新加入聊天室以后生效。`
  },{trip:data.trip})

  // notify all mods
  server.broadcast({
    cmd: 'info',
    text: `已删除特殊识别码：${data.trip}`,
  }, { level: UAC.isModerator });

  return true;
}
export function initHooks(server) {
  server.registerHook('in', 'chat', this.removetripCheck.bind(this));
}
export function removetripCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
      return false;
  }

  if (payload.text.startsWith('/removetrip')) {
      const input = payload.text.split(' ');
      if (input[1] === undefined) {
          server.reply({
              cmd: 'warn',
              text: '命令语法有误，请发送 `/help removetrip` 来查看帮助',
          }, socket);

          return false;
      }
      this.run(core, server, socket, {
          cmd: 'removetrip',
          trip: input[1],
      });

      return false;
  }

  return payload;
}
export const requiredData = ['trip'];
export const info = {
  name: 'removetrip',
  description: '取消替换识别码',
  usage: `
    API: { cmd: 'removetrip', trip: '<识别码>' }
    文本：以聊天形式发送 /removetrip <识别码>`,
};