# 替换识别码  
### 简介  
该模块可以替换一个识别码

### 最低执行权限  
站长（Admin）

### 如何安装  
直接把本模块丢到 `server/src/commands/admin` 目录（默认）下，随后以站长身份执行reload命令

### 如何调用  
#### 替换识别码  
- 通过WebSocket发送 `{cmd:'addtrip',trip:'旧的识别码',new_trip:'新的识别码'}`
- 在聊天室内发送 `/addtrip 旧的识别码 新的识别码`

#### 取消替换识别码  
- 通过WebSocket发送 `{cmd:'removetrip',trip:'目标识别码'}`
- 在聊天室内发送 `/removetrip 目标识别码`

#### 查看所有替换的识别码
- 通过WebSocket发送 `{cmd:'triplist'}`
- 在聊天室内发送 `/triplist`