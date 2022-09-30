// module main
export async function run(core, server, socket, data) {
    if (server.police.frisk(socket.address, 6)) {
        return server.reply({
            cmd: 'warn',
            text: '你执行此命令速度太快，请稍后再试',
        }, socket);
    }

    // verify user data is string
    if (typeof data.nick !== 'string') {
        return true;
    }

    const zom_socket = server.findSockets({ channel:socket.channel, nick: data.nick });
    if (zom_socket == [] || zom_socket == null || zom_socket.length == 0) {
        return server.reply({
            cmd: 'warn',
            text: '找不到这个用户',
        }, socket);
    }
    if (zom_socket[0].hash == socket.hash || (zom_socket[0].trip == socket.trip && zom_socket[0].trip && socket.trip)) {
        server.reply({
            cmd: 'warn',
            text: '您可能是僵尸号，已被使用kickzom命令踢出。如果您不知道此事，请保证您的密码唯一并没有其他用户与您使用同一网络。',
        }, zom_socket[0]);
        zom_socket[0].terminate();
        server.broadcast({
            cmd:"info",
            text:`${zom_socket[0].nick} 可能是僵尸号，已被 ${socket.nick} 踢出聊天室`
        },{channel:socket.channel})
    } else {
        return server.reply({
            cmd: 'warn',
            text: '这个用户可能不是您本人，这个命令只能踢出您自己',
        }, socket);
    }

    return true;
}

// module hook functions
export function initHooks(server) {
    server.registerHook('in', 'chat', this.kickzomCheck.bind(this),20);
}

// hooks chat commands checking for /nick
export function kickzomCheck(core, server, socket, payload) {
    if (typeof payload.text !== 'string') {
        return false;
    }

    if (payload.text.startsWith('/kickzom')) {
        const input = payload.text.split(' ');

        // If there is no nickname target parameter
        if (input[1] === undefined) {
            server.reply({
                cmd: 'warn',
                text: '命令格式有误，请发送 `/help kickzom` 来查看帮助',
            }, socket);

            return false;
        }

        const Nick = input[1].replace(/@/g, '');

        this.run(core, server, socket, {
            cmd: 'kickzom',
            nick: Nick,
        });

        return false;
    }

    return payload;
}

export const requiredData = ['nick'];
export const info = {
    name: 'kickzom',
    description: '踢出僵尸号，只能踢出同IP或同识别码的用户。',
    usage: `
    API: { cmd: 'kickzom', nick: '<nickname>' }
    文本：以聊天形式发送 /kickzom <目标昵称>`,
};