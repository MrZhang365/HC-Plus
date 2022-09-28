/*
  此命令用于替换识别码
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
  for (var i=0; i<core.config.trips.length; i++) {
    if(core.config.trips[i].old_trip == data.trip) {
      return server.reply({
        cmd:"warn",
        text:"这个识别码已经被替换了，无需重复操作"
      },socket)
    }else if (core.config.trips[i].old_trip == data.new_trip){
      return server.reply({
        cmd:'warn',
        text:'操作无效'
      },socket)
    }else if (core.config.trips[i].new_trip == data.new_trip){
      return server.reply({
        cmd:'warn',
        text:'操作无效'
      },socket)
    }else if (core.config.trips[i].new_trip == data.old_trip){
      return server.reply({
        cmd:'warn',
        text:'操作无效'
      },socket)
    }
  }
  
  // add new trip to config
  core.config.trips.push({ old_trip:data.trip,new_trip:data.new_trip });

  // find targets current connections
  server.broadcast({
    cmd:'info',
    text:`你的识别码已被替换为：${data.new_trip}\n重新加入聊天室以后生效。`
  },{trip:data.trip})

  // notify all mods
  server.broadcast({
    cmd: 'info',
    text: `已将识别码“${data.trip}”替换为：${data.new_trip}`,
  }, { level: UAC.isModerator });

  return true;
}
export function initHooks(server) {
  server.registerHook('in', 'chat', this.addtripCheck.bind(this));
  server.registerHook('out', 'onlineAdd', this.newtrip.bind(this));
  server.registerHook('out', 'onlineSet', this.newtrip.bind(this));
}
export function newtrip(core, server, socket,payload){
  var i;
  if (payload.cmd === 'onlineAdd'){
    if (!payload.trip){
      return payload
    }
    for (i in core.config.trips){
      if (core.config.trips[i].old_trip == payload.trip){
        payload.trip = core.config.trips[i].new_trip
        return payload
      }
    }
    return payload
  }else if (payload.cmd === 'onlineSet'){
    if (!payload.users){
      return payload
    }
    [].length
    if (!payload.users[payload.users.length - 1].trip){
      return payload
    }
    for (i in core.config.trips){
      if (core.config.trips[i].old_trip == payload.users[payload.users.length - 1].trip){
        payload.users[payload.users.length - 1].trip = core.config.trips[i].new_trip
        socket.trip=core.config.trips[i].new_trip
        return payload
      }
    }
    return payload
  }
}
export function addtripCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
      return false;
  }

  if (payload.text.startsWith('/addtrip')) {
      const input = payload.text.split(' ');
      if (input[1] === undefined) {
          server.reply({
              cmd: 'warn',
              text: '命令语法有误，请发送 `/help addtrip` 来查看帮助',
          }, socket);

          return false;
      }else if (input[2] === undefined){
        server.reply({
          cmd: 'warn',
          text: '命令语法有误，请发送 `/help addtrip` 来查看帮助',
        }, socket);

        return false;
      }
      this.run(core, server, socket, {
          cmd: 'addtrip',
          trip: input[1],
          new_trip: input[2]
      });

      return false;
  }

  return payload;
}
export const requiredData = ['trip','new_trip'];
export const info = {
  name: 'addtrip',
  description: '替换识别码',
  usage: `
    API: { cmd: 'addtrip', trip: '<旧的识别码>', new_trip:'<新的识别码>' }
    文本：以聊天形式发送 /addtrip <旧的识别码> <新的识别码>`,
};