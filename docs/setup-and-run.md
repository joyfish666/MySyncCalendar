# 环境依赖与运行方式

## 环境依赖与版本

| 依赖 | 安装版本 | 说明 |
|------|----------|------|
| **Node.js** | `24.11.0` | 通过 nvm 管理，`.nvmrc` 固定此版本 |
| **npm** | `11.6.1` | 随 Node 24.11.0 附带 |
| **Electron** | `41.5.0` | 满足 `^41.0.2` 要求，已修复 CVE-2026-34780 |
| **@capacitor/core** | `7.6.2` | 锁定 `^7.0.0` |
| **@capacitor/filesystem** | `7.1.8` | 锁定 `^7.0.0` |
| **Syncthing** | `2.0.x`（≥2.0.16） | PC 与手机已配对，同步文件夹已验证通过 |

> **注意**：开发前请使用 Node 版本管理工具（如 nvm）运行 `nvm use`，确保 Node.js 版本正确。

## 运行方式

### 首次运行

```bash
# 1. 确保使用正确的 Node.js 版本
nvm use 24.11.0

# 2. 验证版本
node --version   # → v24.11.0
npm --version    # → 11.6.1

# 3. 安装依赖（华为云镜像加速 Electron 下载）
ELECTRON_MIRROR=https://mirrors.huaweicloud.com/electron/ npm install

# 4. 启动应用
npm start
```

### 日常运行

```bash
nvm use 24.11.0
npm start
```

> **注意**：若环境中存在 `ELECTRON_RUN_AS_NODE=1` 变量，Electron 将以纯 Node.js 模式运行导致 `require('electron')` 返回异常。`npm start` 脚本已内置清除该变量。直接调用 `electron .` 时需先执行 `unset ELECTRON_RUN_AS_NODE`。

## 预期行为

- Electron 窗口打开，尺寸 1280×900，最小 900×700
- 默认显示当月月历，今日日期叠加蓝色边框（基础高亮）+ 深蓝底色（选中高亮）
- 点击其他日期 → 选中高亮切换，今日的蓝色边框始终保留
- 点击年份月份区域弹出年月选择器，可快速跳转至任意年月，按 Esc 或点击外部关闭
- `<` / `>` 按钮或键盘 ← → 切换月份
- "回到今日"按钮跳转至当前月份并重新选中今日，选中今日时此按钮隐藏
- 顶部年份月份区域右侧显示选中日期距今天的天数差（如"2天后"/"2天前"），选中今日时隐藏
- 周末和节假日以蓝色显示，非本月日期以灰色显示；点击非本月日期自动跳转至对应月份
- 月历行数按实际需要动态呈现，无多余空白行
- 日期格左上角红色爱心 = 生理期标记，灰色爱心 = 预测生理期；点击 ♥ 按钮切换
- 日期格左下角橙色圆点 = 年度事项标记，右下角绿色圆点 = 单次事项标记
- 点击"＋"按钮弹出创建界面，支持年度/单次事项，可设置可选提醒时间（HH:MM）和备注
- 选中含事项的日期时，日历下方列出事项标题、备注、提醒时间，并提供删除按钮
- 底部切换栏可进入"事件"视图，支持筛选、置顶、排序、编辑、删除等操作
- 点击"🖼"按钮设置壁纸：导入本地图片、管理已存壁纸、开启随机壁纸模式

## 构建独立可执行程序

### 打包命令

```bash
# 使用华为云镜像加速 Electron 下载
ELECTRON_MIRROR=https://mirrors.huaweicloud.com/electron/ npm run build
```

### 构建产物

构建完成后在 `dist/` 目录输出：

| 文件 | 说明 |
|------|------|
| `MySyncCalendar-1.0.0-portable.exe` | 单文件便携版 (~91 MB)，无需安装，双击运行 |
| `win-unpacked/` | 未压缩目录，包含完整运行时 |

### 构建配置 (package.json)

- `electron-builder` + `--win portable` 输出便携版
- `signAndEditExecutable: false` 跳过代码签名
- `artifactName` 自定义输出文件名
- `requestExecutionLevel: user` 避免管理员权限要求
- 每个日期格显示公历数字及农历或节日信息（节假日→节日名称，初一→月份名，其余→日称）
- 底部状态栏显示数据目录路径 `%APPDATA%/MySyncCalendar/Resource`
- 事件、壁纸、设置等所有用户数据统一存储在 `Resource/` 目录中

## Syncthing 同步配置参考

Syncthing 已在 PC 和 Android 设备上安装配置完成，指定同步文件夹已通过局域网验证可正常同步。

PC 端 Syncthing 同步目录建议直接指向 `%APPDATA%/MySyncCalendar/Resource/`，这样事件、壁纸、设置等全部用户数据均可跨设备同步。

为减少干扰文件被同步，在 Syncthing 的文件夹配置中设置忽略规则（`.stignore`），只同步核心数据文件：

```
/*
!/calendar-events.json
```

将上述内容保存为 `.stignore` 并放入同步文件夹根目录，**每个设备都需要手动创建一次**（该文件本身不会被 Syncthing 同步）。
