# 风雪押镖局 · 四城共熬一碗粥

双击 [index.html](index.html) 启动用户端原型。文件可离线运行，无需构建。桌面展示手机壳和路演控制台，手机宽度使用全屏布局。

界面统一使用繁体正楷。字体采用全字库正楷体，沿用唐楷笔意，以 WOFF2 随项目离线分发。OpenCC 在展示时转换活动文案和历史来信，简繁口令均可验证。字体入口为 `--font-handwriting`。[字体授权](assets/fonts/LICENSE.txt) · [官方字体资料](https://data.gov.tw/dataset/5961)

[首页视觉选样](视觉选样.html) 展示默认主画「鹤引双阙」和四个可交互的备选开场。A「云门接镖」、B「松台放鸽」、C「月门交镖」、D「江岸驿站」分别对应 `?look=a`、`?look=b`、`?look=c`、`?look=d`。参数可与分舵参数组合，四款共用业务和当前浏览器存档。

[四页手机实测截图](assets/stone-blue/四页实测.jpg) · [左阙、鸽足与木匣放大图](assets/stone-blue/review-details.jpg)

## 内容与物料口径

- **业务以 04 的「三关一匣」SOP 为准。** 当前四城为西安南门、武汉武昌、南昌万寿宫、苏州山塘街，对应红枣、莲子、桂圆、桂花。故事口述稿、核验暗号及同义词、地标指引、分城歌谱、共同副歌、每城五条种子寄语均取自 04 内容库。
- **画面使用石青山水、青绿彩绘木构和泥金细线。** 大景以用户指定的石青群山为底，取骑鹤吹笛、卷云和双阙的元素。四页器物延用 00 的物料标识、状态和调用接口，当前默认画芯使用本地设色版本。页面与四格文牒采用 04 的活动城市。
- 00 的定稿 CSS 与引用的 SVG 保持同目录。需要临时覆盖时，可在 `data-adapter.js` 加载前注入 `window.ESCORT_SHARED_DATA = { cities: [{id: "xian", name: "…"}], icons: {jujube: "assets/…"}}`。其余城市资料沿用本地副本。主题覆盖表在 `theme-adapter.css` 后加载。

来源：[00 公共物料规范](../00_公共资源/README.md) · [04 四城内容总库](../04_内容与SOP/docs/01_四城民谣故事歌词与暗号总库.md) · [04 门店 SOP](../04_内容与SOP/docs/02_全自助门店执行与腊八施粥SOP.md) · [04 硬件与票面规格](../04_内容与SOP/docs/03_飞鸽传书匣硬件组装与物料清单.md)

### 小程序插画

39 件人物、地标、风物和器物图使用独立透明 WebP；撕票线、扫码标记和蒸汽纹使用本地 SVG。四个底栏入口采用镖旗、蓝布行囊、传书鸽、线装文牒。`nav_*_active`、`nav_*_default` 仍可分别覆盖。物料和大景的生成提示、局部修订及评分见[绘制与复核](assets/stone-blue/绘制与复核.md)。

镖局与行囊使用「鹤引双阙」，飞鸽使用「松台放鸽」，文牒使用「月门交镖」。行囊里的雕花信牌承载播放器。地名匾使用独立的黛青描金画芯，由页面将当前城市的 `site` 文字排在匾心。城市卡片与接镖详情共用同一幅地标立绘。

接镖台展示永宁门城楼、黄鹤楼、万寿宫大牌坊、寒山寺与对应风物。行囊的实际寻味点位由 04 路线字段提供。唐式铜锁、铜印和地标均为按形制绘制的界面插画，参考[永宁门城楼与城墙资料](https://www.cactch.org.cn/webfile/upload/2021/02-04/22-00-4001581366834394.pdf)、[武汉市黄鹤楼重建设计档案](https://www.wuhan.gov.cn/zjwh/whrw/202608/t20260826_2838750.shtml)、[万寿宫四柱三门五楼牌楼](https://xhq.nc.gov.cn/xhqrmzf/bsxx/202510/772c72bc402740d39be94d28e5b7cddd.shtml)、[苏州地方志普明宝塔资料](https://dfzb.suzhou.gov.cn/dfzb/fzxh/200912/e8cdd1a6b75f4a6fa47fff8ac67d24b4.shtml)、[唐代门锁](https://z.hangzhou.com.cn/2020/rwwhql/content/content_7758529.htm)及[故宫馆藏唐代铜高鼻钮印](https://www.dpm.org.cn/collection/seal/229051.html)。

## 路演操作

1. 用控制台选分舵，或打开 `index.html?station=xian` 模拟扫木架码。在接镖台领取电子押镖令，并在门口木架自取实体歌本文牒。其他三城卡片可查风物，寄信和钤印归属本次绑定分舵。
2. 进入「行囊」走三关。听音寻味可模拟到达，或用「风雪免行」输入门口立牌口令。拍摄或选图后生成带歌词和火漆印的海报，也可使用示意图。火塘听曲支持阅读完整口述稿，输入暗号或同义词解锁和弦及歌谱。第三关确认添米和实体钤印，再模拟扫米缸木牌激活飞鸽匣。
3. 「飞鸽」选异城或随机漂流，填写寄语、录 10 秒现场声或使用本城演示音轨，勾选授权后放飞。收件可预听、点亮共鸣火漆印、回信和扫描贴牒。桌面「快进四城三关」会完成四城领令到钤印，「补齐三城来票」将预录票送到收件箱；手机端也可用「余温与备用票」模拟读票。相同异城只计一格。已寄出的信保留在发件箱。
4. 「文牒」同时拥有本城印和三张不同异城的粮票，才展示「晋升金牌总镖头」的吧台凭证。动态演示码有效期 90 秒，店员演示口令为 `2026`。在路演控制台取消「模拟礼盒有货」可演示待补发及一次性登记。核销后可选腊八施粥岗位和轮岗时段，支持候补演示。

| 分舵 | 扫码参数 | 风雪免行演示口令 | 火塘核验 |
| --- | --- | --- | --- |
| 西安南门 | `station=xian` | `FX-XIAN` | 老木吉他、木吉他、老吉他 |
| 武汉武昌 | `station=wuhan` | `FX-WUHAN` | 民谣口琴、口琴、C调口琴 |
| 南昌万寿宫 | `station=nanchang` | `FX-NANCHANG` | 手鼓、鼓、手打鼓 |
| 苏州山塘街 | `station=suzhou` | `FX-SUZHOU` | 返乡机票、回家机票、机票 |

扫码入口可附 `touchpoint=weather`、`touchpoint=plaque` 或 `touchpoint=rice` 打开对应环节，业务前置条件照常生效。已同步的异城票可用 `?station=xian&ticket=<粮票ID>` 打开预览再贴牒。旧演示参数 `a`～`d` 仍可用作扫码入口别名。

## 文件结构

```text
02_小程序原型/
├── index.html
├── 视觉选样.html         四个可交互的首页选项与原画放大入口
├── css/
│   ├── theme-adapter.css  公共色板的语义变量
│   ├── app.css            手机壳、页面、响应式与动效
│   └── film-preview.css   首页备选开场
├── js/
│   ├── sop-content.js     04 四城内容与合奏谱的离线副本
│   ├── data-adapter.js    分舵字段、物料路径、覆写与稳定 ID
│   ├── storage.js         存档及联调队列
│   ├── views.js           页面及弹窗模板
│   └── app.js             三关、传书、核销及演示交互
└── assets/
    ├── public/           00 视觉物料及基础组件副本
    ├── stone-blue/       当前七幅场景与立面、器物图标、局部放大与实测图
    ├── illustrations/    之前的古甲设色物料与绘制记录
    ├── sop/              04 用户旅程物料
    └── audio/            每城 15 秒寻味和 10 秒随票合成试听
```

进度、照片缩略图、信笺、核销与报名保存在 `fengxue.escort.state.v2`。旧版占位任务的档案保留，可复用昵称，旧章和单城领奖记录不计入新文牒。重置会清空本轮 v2 存档与联调队列。浏览器拒绝本地存储时，当前会话仍可演示。

## 与双屏、飞鸽匣和吧台联调

原型沿用出站键 `fengxue.bridge.outbox.v1`、入站键 `fengxue.bridge.inbox.v1` 及 `schemaVersion: 1` 信封。城市 ID 为 `xian`、`wuhan`、`nanchang`、`suzhou`。同源联调端需按新 ID 映射分舵，不能将旧占位事件视为正式四城记录。使用同一 HTTP 源测试多个页面可避开浏览器对本地文件存储的隔离差异。

### 出站事件

`localStorage["fengxue.bridge.outbox.v1"]` 存储 `{schemaVersion:1, events:[...]}`。事件包含 `{schemaVersion,id,type,source,occurredAt,payload}`。同页可监听 `fengxue:escort-event` 读取 `event.detail`，其他同源页面可订阅该键的 `storage` 事件。按外层 `id` 去重，确保同一个打印任务只执行一次。

| type | payload |
| --- | --- |
| `pigeon.sent` | `id, routeId, fromCityId, toCityId, author, tag, body, replyTo, createdAt, source, audio, ticket`。票面包含 `landmark, token, notes, lyric`。 |
| `verification.issued` | `id, code, routeId, stationId, rewardName, issuedAt, expiresAt, ticketIds`。刷新后仅最新未过期凭证有效。 |
| `verification.redeemed` | `credentialId, routeId, stationId, rewardName, redeemedAt, fulfillment`，履约状态为 `collected` 或 `pending`。 |

`audio` 支持预录演示引用 `{kind:"demo",cityId,durationSeconds:10,consent:true}`，或现场录音 `{kind:"recorded",durationSeconds:10,consent:true,dataUrl:"data:audio/webm;base64,…"}`。原型限制录音体积并以本地数据 URL 持久化。正式接入应把音频交给经授权的媒体存储并签发可扫描的播放地址。现场投递用 `source:"live"`，演示预录、余温和备用标记分别为 `seed`、`reserve`、`emergency`。

### 入站粮票

写入 `localStorage["fengxue.bridge.inbox.v1"]`。以下是送往西安分舵的一张预录票。

```json
{
  "schemaVersion": 1,
  "messages": [{
    "id": "incoming-ticket-uuid",
    "fromCityId": "wuhan",
    "toCityId": "xian",
    "author": "守夜老镖师",
    "tag": "民谣粮票",
    "body": "汉阳门这边刚过一阵江风，吹不散这点莲子的清甜。",
    "source": "seed",
    "audio": {"kind":"demo","cityId":"wuhan","durationSeconds":10,"consent":true},
    "replyTo": null,
    "createdAt": "2026-11-20T12:01:00.000Z"
  }]
}
```

小程序启动时读取队列，也监听该键。可在同页写入后派发 `window.dispatchEvent(new Event("fengxue:pigeon-inbox"))` 触发读取。收票按消息 ID 去重，贴牒再按接收分舵及来源城市去重。

### 正式上线所需能力

现场录音未随两份资料交付，内置试听均为清楚标注的合成音轨。定位圈待门店走线、实测及配点，原型以模拟到达与风雪免行覆盖。现场录音需要浏览器麦克风权限，权限未开放时可选内置演示音轨。双屏网络传输、NFC 实机、扫码发码、云打印与黄铜铃、核销权限、顺丰补发及正式志愿报名由后续服务接入。原型的补发和报名只记录演示状态，无需填写收件或联系方式。
