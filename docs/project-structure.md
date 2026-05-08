# 项目目录结构

## 目录树

```
MySyncCalendar/
├── .gitignore                  # 忽略 node_modules、android/、dist 等
├── .nvmrc                      # 指定 Node 版本（内容：24.11.0）
├── package.json                # 项目描述、脚本、依赖声明
├── package-lock.json           # 依赖版本锁定
├── readme.md                   # 项目入口文档
├── docs/                       # 专题文档
│   ├── roadmap.md              # 开发阶段与路线
│   ├── phase1-spec.md          # Phase 1 功能规格
│   ├── architecture.md         # 技术架构
│   ├── project-structure.md    # 项目目录结构与模块架构（本文件）
│   └── setup-and-run.md        # 环境依赖与运行方式
├── src/                        # 所有网页代码（主要编写的地方）
│   ├── index.html              # 日历主页面（骨架 DOM）
│   ├── style.css               # 日历样式（含两级高亮系统）
│   └── app.js                  # 日历引擎、渲染、交互、数据存取
├── scripts/                    # 启动脚本
│   └── start.js                # 清除 ELECTRON_RUN_AS_NODE 后启动 Electron
├── electron/                   # Electron 专属文件
│   ├── main.js                 # 主进程：窗口、IPC、原子写入、冲突清理、壁纸管理、生理期数据
│   └── preload.js              # 预加载脚本：contextBridge 暴露 calendarAPI（壁纸/生理期）
├── capacitor.config.json       # Capacitor 配置（Phase 2 创建）
└── android/                    # Android 原生项目（Phase 2 生成）
```

## app.js 模块架构

| 模块 | 职责 |
|------|------|
| **CONSTANTS** | 列头文字 `['一'..'日']`、周末索引 `Set(5,6)` |
| **HOLIDAYS** | 2025–2027 年中国节假日，ISO 日期映射至节日名称 |
| **LunarCalendar** | 公历转农历算法（1900–2100 年数据），农历日名称与月份名称 |
| **state** | 应用状态：`viewYear`, `viewMonth`, `selectedDate`, `todayDate`, `events` |
| **DateUtils** | 纯函数工具集：日期计算、周一偏移转换、ISO格式化、节假日判断、农历文本、天数差 |
| **CalendarEngine** | `generateGrid(year, month, todayISO)` → cell 描述符数组，含事件匹配 |
| **Renderer** | 全部 DOM 操作：表头、选择器、事项弹窗、壁纸菜单、网格重建、选中切换、天数差、事件列表、事件视图、壁纸应用 |
| **Controller** | 事件处理：日期点击、选择器交互、事项 CRUD、置顶、月份导航、视图切换、筛选切换、键盘绑定 |
| **DataManager** | 异步文件 I/O，通过 `window.calendarAPI` 读写 JSON（事项/生理期数据）、冲突清理 |
