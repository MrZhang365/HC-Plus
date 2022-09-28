# 模组列表  
### 简介  
该模块修复了原dumb.js中关于emote的BUG，并且做了汉化处理，同时加上了自动解除禁言功能。

### 最低执行权限
模组（Mod）

### 如何安装
直接把本模块丢到 `server/src/commands/mod` 目录（默认）下，随后以站长身份执行reload命令

### 如何调用
#### 设置禁言  
- 通过WebSocket发送 `{cmd:'dumb',nick:'<目标昵称>',time:禁言的分钟数，类型为数字。如果为0则永久禁言}`
- 在聊天室内发送 `/dumb 目标昵称 禁言的分钟数，。如果为0则永久禁言`

#### 立刻取消禁言
- 通过WebSocket发送 `{cmd:'speak',hash:'<目标用户的hash值>'}`
- 在聊天室内发送 `/speak 目标用户的hash值`