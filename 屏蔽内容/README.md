# 屏蔽内容  
### 简介  
该模块屏蔽一个关键词，即禁止所有用户发送包含某个关键词的信息。

### 最低执行权限
模组（Mod）

### 如何安装
直接把本模块丢到 `server/src/commands/mod` 目录（默认）下，随后以站长身份执行reload命令

### 如何调用
#### 添加屏蔽内容  
- 通过WebSocket发送 `{cmd:'addshield',text:'要屏蔽的关键词'}`
- 在聊天室内发送 `/addshield 要屏蔽的关键词`

#### 删除屏蔽内容  
- 通过WebSocket发送 `{cmd:'removeshield',text:'要取消屏蔽的关键词'}`
- 在聊天室内发送 `/removeshield 要取消屏蔽的关键词`

#### 查看所有屏蔽内容  
- 通过WebSocket发送 `{cmd:'shieldlist'}`
- 在聊天室内发送 `/shieldlist`