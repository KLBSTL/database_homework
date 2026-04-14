# lease-master

这是一个基于 Maven 的 Spring Boot 多模块后端项目，包含两个可启动服务：

- `web-admin`：后台管理接口，默认端口 `8081`
- `web-app`：用户端接口，默认端口 `8082`

## 运行环境

- JDK 17
- Maven 3.9+
- MySQL 8.x
- Redis 7.x
- 可选：MinIO（后台上传接口会用到）

项目已经在仓库内提供了 [`.mvn/global-settings.xml`](.mvn/global-settings.xml) 和 [`maven-user-settings.xml`](maven-user-settings.xml)。构建脚本会显式使用这两份配置，避免受本机全局 Maven `settings.xml` 异常影响，同时把 Maven 本地仓库放到项目内的 `.mvn/repository`，避免系统默认仓库目录不可写导致失败。

## 默认配置

默认配置文件：

- [`web/web-admin/src/main/resources/application.yml`](web/web-admin/src/main/resources/application.yml)
- [`web/web-app/src/main/resources/application.yml`](web/web-app/src/main/resources/application.yml)

默认依赖如下：

- MySQL：`127.0.0.1:3306`
- 数据库：`lease`
- 用户名：`root`
- 密码：`123456`
- Redis：`127.0.0.1:6379`
- MinIO：`127.0.0.1:9000`

如果你的本机配置和默认值不同，可以在启动脚本中直接传参数，或者提前设置环境变量：

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_DATABASE`
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET_NAME`
- `ALIYUN_SMS_ACCESS_KEY_ID`
- `ALIYUN_SMS_ACCESS_KEY_SECRET`
- `ALIYUN_SMS_ENDPOINT`

## 数据库初始化

仓库根目录已包含初始化数据文件 [`lease.sql`](lease.sql)。

导入方式一：使用脚本

```powershell
powershell -ExecutionPolicy Bypass -File .\init-db.ps1
```

如果你的 MySQL 密码不是 `123456`：

```powershell
powershell -ExecutionPolicy Bypass -File .\init-db.ps1 -Password "你的密码"
```

导入方式二：手动导入

```powershell
mysql -h 127.0.0.1 -P 3306 -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS lease DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
mysql -h 127.0.0.1 -P 3306 -u root -p123456 lease --default-character-set=utf8mb4 < lease.sql
```

## 构建

```powershell
powershell -ExecutionPolicy Bypass -File .\build.ps1
```

等价命令：

```powershell
mvn -gs .mvn/global-settings.xml -s .\maven-user-settings.xml clean package -DskipTests
```

## 启动

启动后台管理端：

```powershell
powershell -ExecutionPolicy Bypass -File .\run-admin.ps1
```

如果数据库密码不同：

```powershell
powershell -ExecutionPolicy Bypass -File .\run-admin.ps1 -DbPassword "你的密码"
```

启动用户端接口：

```powershell
powershell -ExecutionPolicy Bypass -File .\run-app.ps1
```

如果数据库密码不同：

```powershell
powershell -ExecutionPolicy Bypass -File .\run-app.ps1 -DbPassword "你的密码"
```

也可以直接在 IDE 中运行以下启动类：

- `com.atguigu.lease.AdminWebApplication`
- `com.atguigu.lease.AppWebApplication`

## 接口文档

启动后可尝试访问：

- 后台管理端：`http://127.0.0.1:8081/doc.html`
- 用户端接口：`http://127.0.0.1:8082/doc.html`

## 常见问题

### 1. Maven 一启动就报 `settings.xml` 解析失败

仓库已经内置 `.mvn/maven.config`，正常在项目根目录执行 `mvn` 就会自动绕过全局错误配置。如果仍有问题，请确认命令是在仓库根目录执行。

### 2. 启动时报数据库不存在

先执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\init-db.ps1
```

### 3. 启动时报 Redis 连接失败

请先启动本机 Redis，并确保端口是 `6379`。

### 4. 启动时报文件上传相关错误

请启动 MinIO，并创建或允许程序创建 bucket `lease`。
"# database_homework" 
