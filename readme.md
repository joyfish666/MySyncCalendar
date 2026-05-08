# MySyncCalendar

一个完全私有、跨平台同步的个人日历工具。

## 核心目标

- 在 **Windows 桌面** 和 **Android 手机** 上独立运行
- 无需任何云服务，数据通过本地文件在设备间自动同步
- 完全按个人喜好扩展功能（分类、提醒、倒计时等）

## 当前阶段

**Phase 1 — 桌面端** 🚧 进行中

完成 Electron 壳 + 前端 UI + 本地 JSON 文件读写的全部功能。Phase 2（手机端）与 Phase 3（同步验证）将在桌面端稳定后依次推进。

## 快速开始

```bash
nvm use 24.11.0
ELECTRON_MIRROR=https://mirrors.huaweicloud.com/electron/ npm install
npm start
```

### 构建独立 .exe

```bash
npm run build
# 输出: dist/MySyncCalendar-1.0.0-portable.exe (~91 MB)
```

构建产物为单文件便携版，无需安装，双击即运行。

## 文档索引

| 文档 | 内容 |
|------|------|
| [开发阶段与路线](docs/roadmap.md) | 三阶段划分、状态、依赖关系 |
| [Phase 1 功能规格](docs/phase1-spec.md) | 界面布局、日期显示规则、两级高亮系统、交互操作 |
| [技术架构](docs/architecture.md) | 架构图、同步冲突处理、原子写入、共享文件夹与权限设计 |
| [项目目录结构](docs/project-structure.md) | 完整目录树、app.js 模块架构表 |
| [环境依赖与运行方式](docs/setup-and-run.md) | 版本表、安装与启动命令、预期行为、Syncthing 配置参考 |
