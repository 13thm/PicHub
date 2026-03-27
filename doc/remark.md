# docker 部署minio

```
docker pull minio/minio:RELEASE.2025-04-22T22-12-26Z
```

第一次写好配置文件：
```
docker run -d ^
  -p 9000:9000 ^
  -p 9001:9001 ^
  --name minio ^
  -v "D:/Program Files/docker-save/docker-volumes/minio/data":/data ^
  -v "D:/Program Files/docker-save/docker-volumes/minio/config":/root/.minio ^
  -e "MINIO_ROOT_USER=minioadmin" ^
  -e "MINIO_ROOT_PASSWORD=minioadmin123" ^
  --restart=always ^
  minio/minio:RELEASE.2025-04-22T22-12-26Z server /data ^
  --console-address ":9001"
```
第二次之后

```
docker start minio
docker stop minio
```

# redis

```
docker pull redis:7.4


docker run -d --name redis-server -p 6379:6379 -v "D:/Program Files/docker-save/docker-volumes/redis/conf:/etc/redis" -v "D:/Program Files/docker-save/docker-volumes/redis/data:/data" --restart=always redis:7.4 redis-server /etc/redis/redis.conf

docker stop redis-server
docker start redis-server
```

配置文件,：
```
################################## NETWORK #####################################

# 允许所有IP访问
bind 0.0.0.0
# 关闭保护模式（因为绑定了0.0.0.0且通常容器内不需要保护模式，但必须配密码）
protected-mode no
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300

################################# GENERAL #####################################

# 【关键修改】Docker容器内必须设为 no，否则容器会启动后立即退出
daemonize no
pidfile /var/run/redis_6379.pid
loglevel notice
# 日志输出到标准输出，方便 docker logs 查看
logfile ""
databases 16
always-show-logo yes

################################ SNAPSHOTTING ##################################

save 900 1
save 300 10
save 60 10000

stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
# 指向挂载的数据目录
dir /data

################################### SECURITY ###################################

# 【关键修改】必须设置密码！
requirepass 123456

# 禁用危险命令（生产环境好习惯）
rename-command CONFIG ""
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""

################################### CLIENTS ####################################

maxclients 10000

############################## MEMORY MANAGEMENT ################################

# 限制最大内存（确保 Docker 容器内存限制大于此值）
maxmemory 2gb
# 内存满时剔除策略：剔除任意key
maxmemory-policy allkeys-lru
maxmemory-samples 5

############################## APPEND ONLY MODE ###############################

appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
aof-use-rdb-preamble yes

################################ LUA SCRIPT ###################################

lua-time-limit 5000

############################### ADVANCED CONFIG ###############################

hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
stream-node-max-bytes 4096
stream-node-max-entries 100
activedefrag yes
active-defrag-ignore-bytes 100mb
active-defrag-threshold-lower 10
active-defrag-threshold-upper 100
active-defrag-cycle-min 1
active-defrag-cycle-max 25

# Redis 7.4 多线程优化
io-threads 4
io-threads-do-reads yes
```