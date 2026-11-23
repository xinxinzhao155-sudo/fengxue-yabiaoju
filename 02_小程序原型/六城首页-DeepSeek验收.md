## 独立评分：**10 / 10**

已按只读方式检查源码、[.six-qa/run.cjs](</Users/xinxinzhao/Desktop/大冰的小屋·风雪押镖局/02_小程序原型/.six-qa/run.cjs>)、[六城首页实测.png](</Users/xinxinzhao/Desktop/大冰的小屋·风雪押镖局/02_小程序原型/assets/stone-blue/六城首页实测.png>) 和测试记录。原项目复制到 `/tmp/six-qa/project` 后运行，交付目录未改动。

![六城首页实测](</Users/xinxinzhao/Desktop/大冰的小屋·风雪押镖局/02_小程序原型/assets/stone-blue/六城首页实测.png>)

### 验证结果

- 原样运行 `run.cjs`：  
  `PASS six cards, new routes visible without scrolling at 320/390/1440, both city switches/3 gates/send, five-ticket collection, redeem, refresh, reset, offline, zero JS errors`
- 自建 Playwright 断言：60/60 通过，覆盖音频、六格、原四城、旧 v1/v2 存档。
- 另测桌面 1440×900 的两城切换、领镖、横竖画、音频播放，均无 `pageerror`。

### 分项得分

| 验收项 | 得分 | 证据 |
|---|---:|---|
| 默认首页手机/桌面不滚动可见长沙、成都及公共库美术 | **2/2** | 390×844 和 1440×900 首屏均完整显示 6 张城市卡，顺序为长沙、成都、西安、武汉、南昌、苏州；首行长沙/成都坐标分别约 `128–274`、`242–388`。6 张卡图全部加载：新两城使用公共库横幅 `1536×1024`，原四城地标图也正常显示。320×568 首行长沙/成都同样可见。 |
| 两条路线切换分舵、领镖、查看横竖画 | **2/2** | 长沙卡 → 弹窗竖画 `changsha.webp` `1086×1448` → `?station=changsha` → 状态确认分舵 → 揭榜领令 → 行囊横画 `changsha_shanshui.webp` `1536×1024`。成都同样通过。桌面 1440 也复测通过。 |
| 两城押镖三关和飞鸽传书 | **2/2** | 长沙、成都均走通：听音寻味 → 错误口令被拒 → 正确口令进入火塘 → 落米成音 → 钤印 → 飞鸽寄信。两城寻味音轨 15 秒、粮票音轨 10 秒，均能加载并播放；寄信后发件箱状态持久化。另实测收件、共鸣火漆印、回信预填、贴票。 |
| 六格核销：一印五票、刷新持久化、重置正常 | **2/2** | 长沙第六格状态为 `stampedAt` 有效 + `tickets = chengdu, nanchang, suzhou, wuhan, xian`，UI 显示 `6 / 6 已入牒`，标签为 1 个“本城朱印”加 5 张不同异城粮票；重复贴同一城被拒。核销码 6 位，错误口令 `9999` 被拒，`2026` 核销为 `collected`。刷新后 6/6 与“已核销”仍在；重置后 routes、incoming、outgoing、events 全清，刷新后仍为空。 |
| 原四城与旧存档兼容 | **2/2** | 原四城卡片和名称完整；`?station=xian/wuhan/nanchang/suzhou` 均进入正确分舵并通过第一关；西安另走通完整三关和寄信。旧 v1 存档会复用昵称“旧镖师”，旧印章/票不计入新文牒，v1 键保留；旧 v2 仅含四城时，西安既有进度和票保留，长沙/成都路由自动补齐，界面显示 `2 / 6`。 |

### 非阻断观察（均不改变上述判定）

1. **桌面端竖画有短暂空白加载态**  
   1440×900 点击长沙卡后立即截图，右侧竖画区域会空白约 0.4 秒；500ms 后 `changsha.webp` 正常显示。  
   复现：1440 宽打开首页 → 点长沙卡 → 立即截图；或在 DevTools 中观察 `img.sheet-landmark` 的 `complete/naturalWidth`。这是缺少图片占位/预加载，不是加载失败。

2. **桌面首屏木架与底部主画在折叠线下**  
   1440×900、`scrollTop=0` 时六张城市卡完整可见；木架卡从约 `y=792` 开始，而 `#screen` 底部约 `802`，按钮需轻微滚动。底部《鹤引双阙》主画不在桌面首屏。  
   按项目演示文档“首行城市卡即两条路线”的口径，两城领镖路径不受影响；若把木架按钮也作为必测路线，这是桌面布局的改进点。

3. **非西安分舵的“本城朱印”格使用城市画**  
   长沙完成六格后，本城格显示 `changsha.webp` 城市画，而西安才使用 `tangSeal` 印章图；文案“本城朱印”、勾选和计数正确，核销不受影响。  
   复现：长沙六格完成 → 文牒页查看本城格。若要求六格中必须一眼看到印章图形，这是视觉一致性问题。

4. **`run.cjs` 会覆盖交付截图**  
   [run.cjs](</Users/xinxinzhao/Desktop/大冰的小屋·风雪押镖局/02_小程序原型/.six-qa/run.cjs#L7>) 第 7 行把截图写到 `assets/stone-blue/六城首页实测.png`；若在原目录直接运行会改动交付文件。本次在副本运行，原目录未写入。

5. **测试记录中的 diagnostics 不是小程序错误**  
   [.six-qa/diagnostics.txt](</Users/xinxinzhao/Desktop/大冰的小屋·风雪押镖局/02_小程序原型/.six-qa/diagnostics.txt>) 只有 `ACCOUNT_SIGN_IN_REQUIRED`，属于 DSH 账户诊断；实际 `run.cjs` 与浏览器测试均通过，未见 `pageerror`。

### 源码核对

- 首页排序把带 `landscape` 的新两城置顶：[views.js](</Users/xinxinzhao/Desktop/大冰的小屋·风雪押镖局/02_小程序原型/js/views.js#L127>)
- 城市卡用横幅、接镖弹窗用竖幅：[views.js](</Users/xinxinzhao/Desktop/大冰的小屋·风雪押镖局/02_小程序原型/js/views.js#L319>)
- 旧存档迁移与 v1 昵称复用：[storage.js](</Users/xinxinzhao/Desktop/大冰的小屋·风雪押镖局/02_小程序原型/js/storage.js#L49>)
- 六格资格判断 `5 张异城票 + 本城印`：[views.js](</Users/xinxinzhao/Desktop/大冰的小屋·风雪押镖局/02_小程序原型/js/views.js#L274>)
- 重置清空 v2 与联调队列：[app.js](</Users/xinxinzhao/Desktop/大冰的小屋·风雪押镖局/02_小程序原型/js/app.js#L752>)

**总分：10 / 10**