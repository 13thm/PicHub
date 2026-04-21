# 图库项目
## 所需依赖
- MySQL
- redis
- minio
- websocket
- react
- springboot2.xx

## 运行
1. 启动minio
2. 启动redis
3. 启动MySQL
4. 修改配置文件/ 配置环境
5. 运行sql文件 `doc/create_table.sql`
6. 启动前端 
7. 启动后端


## 模块
### 后台管理
后台管理：
![img_1.png](doc/img/img_1.png)
用户管理
![img_2.png](doc/img/img_2.png)

图片管理
![img_3.png](doc/img/img_3.png)
 - minio、caffeine、redis 二级缓存
 - 爬虫采集图片
![img_4.png](doc/img/img_4.png)

图片审核
![img_5.png](doc/img/img_5.png)
空间管理
![img_6.png](doc/img/img_6.png)

### 用户前台
用户首页
![img.png](doc/img/img.png)

空间广场
![img_7.png](doc/img/img_7.png)

我的空间
![img_8.png](doc/img/img_8.png)
- 创建空间
    ![img_9.png](doc/img/img_9.png)
- 审核
![img_10.png](doc/img/img_10.png)
- 编辑空间
![img_11.png](doc/img/img_11.png)
- 空间照片
![img_12.png](doc/img/img_12.png)