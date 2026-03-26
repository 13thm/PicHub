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