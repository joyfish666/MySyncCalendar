# 技术架构

## 总体架构

```
[ Windows 桌面应用 ]        [ Android 手机应用 ]
        │                           │
  (Electron 壳)              (Capacitor 壳)
        │                           │
        ├── 读写 calendar-events.json ─────────┤
        │                           │
        └─────── Syncthing 点对点同步 ─────────┘
                    (局域网 / 互联网)
```

**桌面端**：通过 Electron 的 Node.js 进程直接读写 `%APPDATA%/MySyncCalendar/Resource/` 中的 JSON 文件。  
**手机端**：通过 Capacitor 应用获取 `MANAGE_EXTERNAL_STORAGE` 权限，直接读写 Android 共享存储根目录下的统一同步文件夹（例如 `/storage/emulated/0/SyncthingFiles/`）。两端使用同一份 `calendar-events.json`，由 Syncthing 保持实时一致。

## 同步冲突处理（"最新者胜出"策略）

由于日历操作频率较低，采用简单有效的时间戳覆盖策略：

### 原子写入保护

任何设备写入数据时，都必须先将完整 JSON 写入临时文件（如 `calendar-events.json.tmp`），然后通过原子重命名操作将其重命名为正式文件（`calendar-events.json`）。  
- **Electron 端**：使用 `fs.promises.rename`  
- **Capacitor 端**：利用 Filesystem 插件写入临时文件后，通过原生桥接完成重命名（若插件不支持，需自定义一个小型本地方法实现）

### 启动时冲突清理

应用每次启动时，扫描同步文件夹内所有以 `calendar-events.json` 开头的文件（包括 Syncthing 产生的 `.sync-conflict-*` 文件），读取它们的最后修改时间（`mtime`），保留 `mtime` 最新的那个文件，将其内容作为当前有效数据，并删除其余冲突文件。  
- 具体逻辑：  
  - 收集 `calendar-events.json` 及所有 `.sync-conflict-*` 文件  
  - 比较 `mtime`，选出最新文件  
  - 若最新文件不是 `calendar-events.json`，则将其原子写入为正式文件  
  - 删除其他所有冲突文件  
- 此方法确保了即使两端同时修改，也能自动将数据恢复到最新状态，且不会丢失最新修改。

> **注意**：该策略要求设备间时间偏差控制在合理范围（通常局域网内可忽略不计）。若时间不同步，最新者的判断会失真，建议同步前校准设备时间。

## 数据存储与同步

### 桌面端统一目录

所有用户数据统一存储在 `%APPDATA%/MySyncCalendar/Resource/`：

```
Resource/
├── calendar-events.json        # 事件数据
├── wallpaper-settings.json     # 壁纸设置
└── wallpapers/                 # 壁纸图片
```

同步该目录即可涵盖全部用户数据。

### Android 端

- **同步文件夹**：在 Android 存储根目录下创建 `/storage/emulated/0/SyncthingFiles/`（可在 Syncthing 中灵活配置，但需保证两端指向同一逻辑文件夹）。
- **访问权限**：App 需在 `AndroidManifest.xml` 中声明 `MANAGE_EXTERNAL_STORAGE` 权限，并在运行时引导用户前往系统设置手动开启"允许访问所有文件"。
- **文件读写方式**：获得权限后，使用 `@capacitor/filesystem` 插件配合直接文件路径（`file:///storage/emulated/0/SyncthingFiles/...`）进行读写。

## 技术层级

| 层级 | 技术 | 作用 |
|------|------|------|
| **UI 核心** | HTML + CSS + JavaScript | 日历界面、交互、事件管理逻辑 |
| **桌面壳** | Electron  | 提供 Windows 原生窗口、Node.js 文件读写 |
| **手机壳** | Capacitor  + @capacitor/filesystem  | 将网页封装为 Android APK，并提供原生文件读写（基于共享文件夹） |
| **同步引擎** | Syncthing  | 去中心化的实时文件同步，确保两个设备的 JSON 文件一致 |
