# 强制断开连接  
### 简介  
该模块可以强制断开某用户的连接

### 最低执行权限
模组（Mod）

### 如何安装
直接把本模块丢到 `server/src/commands/mod` 目录（默认）下，随后以站长身份执行reload命令

### 如何调用
- 通过WebSocket发送 `{cmd:'offline',nick:'目标昵称'}`
- 在聊天室内发送 `/offline 目标昵称`