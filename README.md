# HAM 台网点名主控台

业余无线电台网活动的点名记录工具。主控可以手动登记友台，也可以从监听源的最近通联列表中选取候选，核对后加入点名表。活动记录可导出为 Excel 或 JSON。

## 功能

- 记录呼号、时间、QTH、设备、天线、功率、模式、信号报告和备注；支持编辑、搜索及调整起始序号。
- 从 FMO、MMDVM、HAMBOX、BrandMeister DMR 读取通联候选。候选只填入表单，不会自行加入点名表。
- 根据本地呼号档案补全历史资料；QTH 候选支持汉字和拼音首字母检索。
- 导出 Excel 日志和当前点名记录的 JSON 备份。保存按钮和自动保存用于写入 Excel 文件。
- 从旧版点名软件的 `.db3` 文件导入 `qth`、`qsolog` 表，生成呼号档案。

共享呼号资料库同步需要先注册并导入验证密钥；本地点名和 DB3 导入无需启用它。

## 开发运行

需要 Node.js 和 npm。在项目目录执行：

```bash
npm ci
npm run dev
```

Vite 会在终端显示访问地址。生产构建和本地预览：

```bash
npm run build
npm run preview
```

桌面调试使用 `npm run desktop`。该命令先构建页面，再启动 Electron；桌面窗口会连接程序内置的本地服务。

## 桌面打包

| 平台 | 命令 | 输出 |
| --- | --- | --- |
| Windows x64 | `npm run dist:win` | `release/` 中的便携版和目录包 |
| macOS x64 | `npm run dist:mac` | `release/` 中的 DMG |
| macOS Universal | `npm run dist:mac:universal` | `release/` 中的 DMG |

龙芯新世界（Linux loong64）使用社区构建的 Electron 42.3.0 运行时。在龙芯机器上执行：

```bash
npm ci --ignore-scripts
npm run build
npm run dist:loong64 -- /path/to/electron-v42.3.0-linux-loong64.zip
./release/ham-checkin-0.9.1-linux-loong64/electron
```

`--ignore-scripts` 用于避开仅供 Windows 打包使用的 `electron-winstaller` 安装脚本。打包脚本会校验 Electron 压缩包的 SHA-256；运行时文件的来源和下载示例见 [龙芯桌面版说明](docs/loongarch-desktop-build.md)。目录名中的版本号取自 `package.json`，升级版本后应按实际目录名运行。

## 数据与导入

点名记录保存在当前应用地址的浏览器存储中，呼号档案保存在 IndexedDB；旧版档案数据会在首次加载时迁移。Electron 桌面版通过本机服务打开页面。更换浏览器、应用地址或用户数据目录时，原有数据不会自动跟随。

导入 DB3：打开“数据库选项” → “导入 DB3”，选择旧软件的数据库文件。导入结果会加入呼号档案，供后续输入呼号时检索；不会把旧 `qsolog` 逐条加入当前活动的点名表。“整理档案并刷新候选索引”是单独的维护操作，日常点名不需要运行。

JSON 导出只包含当前点名记录。要留存活动结果，请另行导出 Excel；不要把 JSON 备份当作完整呼号档案备份。

