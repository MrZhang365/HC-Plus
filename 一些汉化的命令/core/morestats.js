/*
  Description: Outputs more info than the legacy stats command
*/

// module support functions
const { stripIndents } = require('common-tags');

const formatTime = (time) => {
  let seconds = time[0] + time[1] / 1e9;

  let minutes = Math.floor(seconds / 60);
  seconds %= 60;

  let hours = Math.floor(minutes / 60);
  minutes %= 60;

  const days = Math.floor(hours / 24);
  hours %= 24;

  return `${days.toFixed(0)}天 ${hours.toFixed(0)}小时 ${minutes.toFixed(0)}分钟 ${seconds.toFixed(0)}秒`;
};

// module main
export async function run(core, server, socket) {
  // gather connection and channel count
  let ips = {};
  let channels = {};
  // for (const client of server.clients) {
  server.clients.forEach((client) => {
    if (client.channel) {
      channels[client.channel] = true;
      ips[client.address] = true;
    }
  });

  const uniqueClientCount = Object.keys(ips).length;
  const uniqueChannels = Object.keys(channels).length;

  ips = null;
  channels = null;

  // dispatch info
  server.reply({
    cmd: 'info',
    text: stripIndents`活跃的用户数量：${uniqueClientCount}
                       活跃房间数量：${uniqueChannels}
                       用户加入次数：${(core.stats.get('users-joined') || 0)}
                       邀请信息发送次数：${(core.stats.get('invites-sent') || 0)}
                       信息发送次数：${(core.stats.get('messages-sent') || 0)}
                       封禁用户数量：${(core.stats.get('users-banned') || 0)}
                       踢出用户数量：${(core.stats.get('users-kicked') || 0)}
                       服务器状态请求次数：${(core.stats.get('stats-requested') || 0)}
                       服务器稳定运行时间：${formatTime(process.hrtime(core.stats.get('start-time')))}`,
  }, socket);

  // stats are fun
  core.stats.increment('stats-requested');
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.statsCheck.bind(this), 26);
}

// hooks chat commands checking for /stats
export function statsCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/stats')) {
    this.run(core, server, socket, {
      cmd: 'morestats',
    });

    return false;
  }

  return payload;
}

export const info = {
  name: 'morestats',
  description: '查看服务器详细的状态信息',
  usage: `
    API: { cmd: 'morestats' }
    文本：以聊天形式发送 /stats`,
};
