# Loongarch桌面版

当前使用社区构建的 Electron 42.3.0 `linux-loong64` 运行时，制作便携目录包。项目源码所用的 Electron 42.4.1 与运行时处于同一主版本；

在龙芯机器的项目目录执行：

```bash
npm ci --ignore-scripts
npm run build
curl -fL -o /tmp/electron-v42.3.0-linux-loong64.zip \
  https://github.com/darkyzhou/electron-loong64/releases/download/v42.3.0/electron-v42.3.0-linux-loong64.zip
npm run dist:loong64 -- /tmp/electron-v42.3.0-linux-loong64.zip
```

打包脚本会核对运行时压缩包的 SHA-256，然后把 `dist`、Electron 入口、Node 服务和生产依赖放入 `release/ham-checkin-0.9.1-linux-loong64/resources/app/`。

完成后运行：

```bash
./release/ham-checkin-0.9.1-linux-loong64/electron
```
