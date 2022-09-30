# 移除命令  
### 简介  
该模块可以移除一个命令  

### 最低执行权限
站长（Admin）

### 如何安装
直接把本模块丢到 `server/src/commands/admin` 目录（默认）下，随后以站长身份执行reload命令

### 如何调用
移除：
- 通过WebSocket发送 `{cmd:'removecmd',command:'<命令名称>'}`
- 在聊天室内发送 `/removecmd 命令名称`

恢复命令：
- 执行 `reload` 命令即可恢复被移除的命令。