# 锁定房间  
### 简介  
该模块可以锁定一个房间，即禁止非信任用户加入。

### 最低执行权限  
管理员（Mod）

### 如何安装  
直接把本模块丢到 `server/src/commands/mod` 目录（默认）下，随后以站长身份执行reload命令

### 如何调用  
#### 锁定房间  
- 通过WebSocket发送 `{cmd:'lockroom',channel:'要锁定的房间，如果不填则锁定你所在的房间'}`
- 在聊天室内发送 `/lockroom 要锁定的房间，如果不填则锁定你所在的房间`

#### 取消替换识别码  
- 通过WebSocket发送 `{cmd:'unlockroom',channel:'要解除锁定的房间，如果不填则解除锁定你所在的房间'}`
- 在聊天室内发送 `/unlockroom 要解除锁定的房间，如果不填则解除锁定你所在的房间`

#### 查看所有被锁定的房间
- 通过WebSocket发送 `{cmd:'lockedroomlist'}`
- 在聊天室内发送 `/lockedroomlist`

### 备注
#### 如何允许非管理员加入被锁定的房间？  
很简单，只需要想方设法把那名用户的等级提升到信任用户（TrustedUser）即可。