/*
  Description: Legacy stats output, kept for compatibility, outputs user and channel count
*/

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
    text: `${uniqueClientCount} 个活跃的用户在 ${uniqueChannels} 个房间里`,
  }, socket);

  // stats are fun
  core.stats.increment('stats-requested');
}

export const info = {
  name: 'stats',
  description: '查看服务器简略的状态信息',
  usage: `
    API: { cmd: 'stats' }`,
};
