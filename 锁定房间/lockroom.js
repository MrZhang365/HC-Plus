import * as UAC from '../utility/UAC/_info';
export async function init(core) {
  if (core.lockedroom === undefined){
    core.lockedroom = []
  }
}
// module main
export async function run(core, server, socket,data) {
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 20);
  }
  if (data.channel === undefined || data.channel === ''){
    data.channel=socket.channel
  }
  if (core.lockedroom.indexOf(data.channel) !== -1){
    return server.reply({
      cmd:"warn",
      text:"这个房间已经被锁定了，无需重复操作"
    },socket)
  }
  core.lockedroom.push(data.channel)
  server.broadcast({
    cmd:"info",
    text:`${socket.nick} 已锁定 ?${data.channel}`
  },{level: UAC.isModerator})
  server.broadcast({
    cmd:"info",
    text:"该房间已被锁定"
  },{channel:data.channel,level:(level) => level < UAC.levels.moderator})
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'join', this.joinCheck.bind(this),1);
  server.registerHook('in','chat',this.lockroomCheck.bind(this));
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function lockroomCheck(core,server,socket,payload){
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/lockroom')) {
    const input = payload.text.split(' ');
    this.run(core, server, socket, {
        cmd: 'lockroom',
        channel: input[1],
    });

    return false;
  }

  return payload;
}
// hook incoming chat commands, prevent chat if they are user
export function joinCheck(core, server, socket, payload) {
  if (payload.channel===undefined || payload.channel===""){
    return false
  }
  if (core.lockedroom.indexOf(payload.channel) === -1){
    return payload
  }
  const joinModule = core.commands.get('join');
  const userInfo = joinModule.parseNickname(core, payload);
  if (typeof userInfo === "string"){
    return payload
  }
  if (UAC.isModerator(userInfo.level)){
    server.reply({
      cmd:"info",
      text:"此房间处于锁定状态。如果情况稳定，那么请立刻解除锁定。"
    },socket)
    return payload
  }else if (UAC.isTrustedUser(userInfo.level)){
    server.reply({
      cmd:"info",
      text:"此房间处于锁定状态，如果情况稳定，那么请联系管理员解除锁定。"
    },socket)
    return payload
  }else{
    server.reply({
      cmd:"warn",
      text:"# :(\n## 此房间遇到问题，处于锁定状态。\n#### 房间会在出现非常混乱的情况时暂时锁定，也会在特殊时期时进行宵禁或暂时锁定。\n###### 有关此问题的解决方法：\n- 如果你是站长、管理员或信任用户，请加好你的密码。\n- 耐心等待。"
    },socket)
    socket.terminate()
    return false
  }
}

// module meta
export const info = {
  name: 'lockroom',
  description: '锁定一个房间',
  usage: `
    API: { cmd: 'lockroom',channel:'<目标房间（选填）>' }
    文本：以聊天形式发送 /lockroom <目标房间（选填）>`,
};
