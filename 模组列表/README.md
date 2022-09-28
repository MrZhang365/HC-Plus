# 新版禁言功能  
### 简介  
该模块可以查看目前存在的所有模组（Mod）

### 最低执行权限
站长（Admin）

### 如何安装
直接把本模块丢到 `server/src/commands/admin` 目录（默认）下，随后以站长身份执行reload命令

### 如何调用
#### 设置禁言  
- 通过WebSocket发送 `{cmd:'modlist'}`
- 在聊天室内发送 `/modlist`