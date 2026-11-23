(() => {
  "use strict";

  const USE_PUBLIC_ASSETS = false;
  const PUBLIC_ROOT = "../00_公共资源/";
  const PUBLIC_ICON_BASE_PATH = '../00_公共资源/02_交互图标库/';
  const PUBLIC_AUDIO_BASE_PATH = PUBLIC_ROOT + "03_真实录音/";
  const PUBLIC_THEME_PATH = PUBLIC_ROOT + "theme.css";

  const cities = {
    xian: {
      name: "西安南门", short: "西安", ingredient: "红枣", scene: "永宁门城墙风雪",
      coordinate: [34.2515, 108.9424], token: "token_xian_jujube.svg",
      style: "箱琴扫弦", audioFile: "xian_nanmen.mp3", receiptFile: "assets/receipt-xian.jpg",
      notation: "3 5 6 · 1′ | 6 5 3 2 —", lyric: "雪落南门外，炭火等你来。",
      messages: ["南门的雪落了一整晚。寄一颗红枣给你，愿今夜有人等你回家。", "城墙下的木琴刚响，先给远方的你留一张靠火的位置。", "走了再远的夜路，也记得吃一口热的。"],
      chords: [[40,47,52,55,59,64],[48,52,55,60,64],[43,50,55,59,62,67],[38,45,50,57,62,66]],
      melody: [59,62,64,67,64,62,59,57]
    },
    wuhan: {
      name: "武汉武昌", short: "武汉", ingredient: "莲子", scene: "武昌江滩汽笛",
      coordinate: [30.5528, 114.3038], token: "token_wuhan_lotus.svg",
      style: "口琴与木吉他", audioFile: "wuhan_wuchang.mp3", receiptFile: "assets/receipt-wuhan.jpg",
      notation: "5 6 1′ · 2′ | 1′ 6 5 —", lyric: "汽笛过江来，莲香落满怀。",
      messages: ["江滩上的汽笛刚刚响过。这颗莲子，替长江给你捎个好。", "江风很凉，火塘很暖。愿你身边也有一个肯听你唱歌的人。", "有人过江，有人还在赶路。来听十秒，歇一歇。"],
      chords: [[43,50,55,59,62,67],[40,47,52,55,59,64],[48,52,55,60,64],[38,45,50,57,62,66]],
      melody: [67,69,72,74,72,69,67,64]
    },
    nanchang: {
      name: "南昌万寿宫", short: "南昌", ingredient: "桂圆", scene: "万寿宫古戏台檐铃",
      coordinate: [28.6763, 115.8901], token: "token_nanchang_longan.svg",
      style: "木吉他泛音分解", audioFile: "nanchang_wanshougong.mp3", receiptFile: "assets/receipt-nanchang.jpg",
      notation: "1 3 5 · 6 | 5 3 2 1 —", lyric: "戏台风铃轻，桂圆煨到明。",
      messages: ["老戏台檐下的风铃响了。这颗桂圆煨得甜，给今夜的你。", "今夜的灯先别熄。我们隔着山水，分同一口热粥。", "万寿宫的老街还亮着灯，愿晚归的人都有一盏。"],
      chords: [[48,55,60,64,67,72],[45,52,57,60,64,69],[41,48,53,57,60,65],[43,50,55,59,62,67]],
      melody: [60,64,67,69,67,64,62,60]
    },
    suzhou: {
      name: "苏州山塘街", short: "苏州", ingredient: "桂花", scene: "山塘街摇橹拱桥",
      coordinate: [31.3196, 120.6013], token: "token_suzhou_osmanthus.svg",
      style: "江南五声指弹", audioFile: "suzhou_shantangjie.mp3", receiptFile: "assets/receipt-suzhou.jpg",
      notation: "6 1′ 2′ · 3′ | 2′ 1′ 6 5 —", lyric: "摇橹过山塘，半城桂花香。",
      messages: ["山塘桥下的船慢慢摇。一撮桂花，给你那碗粥添点甜。", "河面收走了白天的喧闹。留这十秒，给还没睡的你。", "借一盏山塘的灯，照照你回家的路。"],
      chords: [[45,52,57,60,64,69],[48,55,60,64,67,72],[43,50,55,60,62,67],[45,52,57,60,64,69]],
      melody: [69,72,74,76,74,72,69,67]
    }
  };

  const icons = {
    bird: '<path d="M3 15l7-2L4 4l9 5 4-2 4 2-3 2-2 5-6 3-3 2 1-4z"/><path d="M10 13l3 1m4-4h.01"/>',
    diagram: '<path d="M4 4h6v6H4zM14 14h6v6h-6zM7 10v7h7m3-3V7h-7"/>',
    sound: '<path d="M3 9h4l5-4v14l-5-4H3zM16 8a5 5 0 0 1 0 8m3-11a9 9 0 0 1 0 14"/>',
    mute: '<path d="M3 9h4l5-4v14l-5-4H3zM16 9l5 6m0-6l-5 6"/>',
    swap: '<path d="M4 8h15l-3-3m4 11H5l3 3"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    music: '<path d="M9 17V5l11-2v12M9 9l11-2"/><ellipse cx="6.5" cy="17.5" rx="2.5" ry="1.8"/><ellipse cx="17.5" cy="15.5" rx="2.5" ry="1.8"/>',
    phone: '<rect x="6" y="2.5" width="12" height="19" rx="2.4"/><path d="M10 5h4m-3 13h2"/>',
    signal: '<path d="M3 8a15 15 0 0 1 18 0m-15 4a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0m-3 4h.01"/>',
    shuffle: '<path d="M3 7h3c5 0 6 10 11 10h4m-3-3 3 3-3 3M3 17h3c1 0 2-.5 3-2m4-6c1-1 2-2 4-2h4m-3-3 3 3-3 3"/>',
    envelope: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    route: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H16a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h7.5"/>',
    bell: '<path d="M4 17h16l-2-3V9a6 6 0 0 0-12 0v5zm6 3h4m-2-18v1"/>',
    printer: '<path d="M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6zm11-3h1"/>',
    clip: '<path d="M9 7v10a3 3 0 0 0 6 0V5a4 4 0 0 0-8 0v13a5 5 0 0 0 10 0V7"/>',
    tear: '<path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM5 14h2m3 0h2m3 0h4"/>',
    scan: '<path d="M8 3H3v5m13-5h5v5m0 8v5h-5M3 16v5h5m-2-9h12"/>',
    glue: '<path d="M8 8V3h8v5m-9 0h10l2 4v9H5v-9zm-2 5h14"/>',
    book: '<path d="M12 6v15c-3-3-6-3-10-2V4c4-1 7-1 10 2 3-3 6-3 10-2v15c-4-1-7-1-10 2z"/>',
    close: '<path d="m6 6 12 12m0-12L6 18"/>',
    play: '<path d="m9 5 11 7-11 7z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    camera: '<path d="M3 7h5l2-3h4l2 3h5v13H3z"/><circle cx="12" cy="13" r="3.5"/>'
  };

  const assets = {
    boxIdle: "box_pigeon_printer_idle.svg", boxActive: "box_pigeon_printer_active.svg",
    passport: "item_escort_songbook_passport.svg", seal: "icon_self_stamp_seal.svg",
    voice: "ui_voice_grain_capsule.svg", tear: "deco_ticket_tear_line.svg",
    divider: "deco_snow_strings_divider.svg", steam: "easter_porridge_music_steam.svg",
    badge: "badge_chief_escort_vest.svg"
  };

  const icon = (name) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[name] + "</svg>";

  function asset(name, fallback) {
    if (!USE_PUBLIC_ASSETS) return fallback;
    return '<span class="public-asset"><img src="' + PUBLIC_ICON_BASE_PATH + name + '" alt=""><span hidden>' + fallback + "</span></span>";
  }

  function token(id) {
    const shapes = {
      xian: '<path d="M13 17c-6 9-2 20 5 22 8 2 17-8 16-17-1-6-5-9-11-9-4 0-7 2-10 4Z" fill="#a43928"/><path d="M16 22c-2 4-2 8 0 11M24 17c0-5 4-10 10-11" fill="none" stroke="#f3af70"/><path d="M26 13c2-7 9-8 15-7-2 6-8 9-15 7Z" fill="#78774e"/>',
      wuhan: '<path d="M10 28Q22 12 39 22Q33 39 17 38Z" fill="#777b50"/><path d="M13 28Q23 14 37 23Q34 32 19 33Z" fill="#9b9864"/><g fill="#f9dfac"><ellipse cx="19" cy="27" rx="3" ry="2"/><ellipse cx="25" cy="23" rx="3" ry="2"/><ellipse cx="31" cy="26" rx="3" ry="2"/><ellipse cx="25" cy="29" rx="3" ry="2"/></g><path d="M19 34l-5 8" stroke="#777b50" stroke-width="2"/>',
      nanchang: '<path d="M25 9c-2 7 1 13 5 18M24 12l-9 12m11-9 11 5" stroke="#818455" stroke-width="2" fill="none"/><circle cx="15" cy="27" r="8" fill="#bd8442"/><circle cx="32" cy="30" r="10" fill="#cb9953"/><path d="M27 25q6-4 10 2" stroke="#f4d18a" fill="none"/><path d="M25 11q7-8 16-3-7 6-16 3" fill="#777b50"/>',
      suzhou: '<path d="M12 40 34 10M20 30 13 15m13 7 12 3" fill="none" stroke="#85845a" stroke-width="2"/><path d="M17 34Q7 35 6 27q9-3 11 7m10-12q4-9 12-6-3 7-12 6m-8 1Q10 24 8 18q9-4 11 5" fill="#7b805b"/><g fill="#e1aa52"><path d="M34 6q5-3 6 2 5 2 0 6-4 4-6 0-6-1-3-5zM32 23q5-3 6 2 5 2 0 6-4 4-6 0-6-1-3-5zM13 10q4-2 4 2 4 1 0 4-3 3-5 0-4-1-2-4z"/></g>'
    };
    return asset(cities[id].token, '<svg viewBox="0 0 48 48" aria-hidden="true">' + shapes[id] + '<path d="M35 38v-8l6-1v2l-4 1v6q0 3-3 3t-2-2q1-2 3-1" fill="currentColor"/></svg>');
  }

  function landmark(id) {
    const shapes = {
      xian: '<path d="M7 32h66v9H7zm7-5h52v5H14zm7-12h38v12H21zm7-10h24v10H28zM13 15Q29 13 40 3q12 10 27 12M9 27q17-4 21-10m40 10q-17-4-21-10M34 40v-4a6 6 0 0 1 12 0v4"/>',
      wuhan: '<path d="M4 39q9-4 18 0t18 0t18 0t18 0M9 32h61M15 29v-7h33l10 7zm13-7v-7h17v7m-10-7V9m23 19V17h8v12M13 33l5 4h44l6-4M5 43h69"/>',
      nanchang: '<path d="M14 40h52m-48-2V22m44 16V22M8 23q18-3 32-17 14 14 32 17ZM26 21h28v14H26zm4 17v-3m20 3v-3M17 25l-4 8m49-8 4 8M37 13h6"/>',
      suzhou: '<path d="M4 39h72M7 35q19 2 26-12 10-15 22 0 7 10 17 12M25 35q9-1 13-10 7-11 13 0 4 8 10 10M5 25h17v9H5zm-3 0 12-9 12 9m45 15q-7 3-16 0M4 43q12-4 25 0t25 0"/>'
    };
    return '<svg viewBox="0 0 80 46" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + shapes[id] + "</svg>";
  }

  function machine(active) {
    const fallback = `<svg class="machine-art" viewBox="0 0 440 238" aria-hidden="true">
      <defs>
        <linearGradient id="front" x2="0" y2="1"><stop stop-color="#653d25"/><stop offset=".47" stop-color="#462818"/><stop offset="1" stop-color="#2d190f"/></linearGradient>
        <linearGradient id="top"><stop stop-color="#3a2419"/><stop offset="1" stop-color="#916344"/></linearGradient>
        <linearGradient id="side"><stop stop-color="#362015"/><stop offset="1" stop-color="#20130e"/></linearGradient>
        <linearGradient id="brass"><stop stop-color="#765025"/><stop offset=".28" stop-color="#c48d49"/><stop offset=".48" stop-color="#f6ce7c"/><stop offset=".75" stop-color="#b47938"/><stop offset="1" stop-color="#755020"/></linearGradient>
        <linearGradient id="plate" x2="0" y2="1"><stop stop-color="#bc8c55"/><stop offset="1" stop-color="#8a5c2f"/></linearGradient>
        <pattern id="grain" width="170" height="31" patternUnits="userSpaceOnUse"><path d="M-10 5Q30-1 64 5T145 5l38-2M-8 11q50-4 90 0t90-1m-180 10Q23 9 64 19t108-1M0 27q30-4 64 0t107-2m-108-7q14-4 31 0-21 5-31 0" fill="none" stroke="#edb27b" stroke-opacity=".15"/></pattern>
      </defs>
      <ellipse cx="211" cy="213" rx="208" ry="21" fill="#0f0906" opacity=".63"/>
      <path d="M37 201h34v18H41q-4 0-4-5zm287 0h34v18h-34zm45-8h31v15h-31z" fill="#21140e"/>
      <path d="m21 103 36-25h326l37 25-50 18H21Z" fill="url(#top)" stroke="#9b6b46" stroke-width="1.4"/>
      <path d="m369 109 51-6v90l-51 20z" fill="url(#side)" stroke="#673e26"/>
      <rect x="21" y="104" width="350" height="109" rx="7" fill="url(#front)" stroke="#a4704b" stroke-width="1.3"/>
      <rect x="22" y="105" width="348" height="106" rx="6" fill="url(#grain)"/>
      <path d="M30 112h329v92H30z" fill="none" stroke="#c48757" stroke-opacity=".48"/>
      <path d="M46 114h299m-299 90h299" stroke="#26170e" stroke-opacity=".8" stroke-width="2"/>
      <path d="M21 124v-14q0-6 7-6h17v7H30v13zm326-20h17q7 0 7 6v14h-9v-13h-15zm-326 88v15q0 6 7 6h17v-8H30v-13zm326 21h17q7 0 7-6v-15h-9v13h-15z" fill="url(#brass)"/>
      <g fill="#432b19"><circle cx="27" cy="110" r="1.7"/><circle cx="365" cy="110" r="1.7"/><circle cx="27" cy="207" r="1.7"/><circle cx="365" cy="207" r="1.7"/></g>
      <rect x="112" y="119" width="167" height="40" rx="3" fill="url(#plate)" stroke="#e3af66"/>
      <rect x="116" y="123" width="159" height="32" rx="1" fill="none" stroke="#654321"/>
      <circle cx="122" cy="139" r="2" fill="#6c4828"/><circle cx="269" cy="139" r="2" fill="#6c4828"/>
      <text x="196" y="144" fill="#321b0d" text-anchor="middle" font-family="STSong,Songti SC,serif" font-weight="800" font-size="18" letter-spacing="4">飞鸽传书匣</text>
      <rect x="66" y="173" width="260" height="16" rx="5" fill="#a27043"/>
      <rect x="70" y="176" width="252" height="10" rx="3" fill="#140e0a"/>
      <path d="M80 184h232" fill="none" stroke="#c28c50" stroke-opacity=".36"/>
      <circle cx="328" cy="139" r="7" fill="#24190f" stroke="#957451"/><circle class="machine-led" cx="328" cy="139" r="3.5" fill="${active ? "#ffbd5f" : "#8a6540"}"/>
      <g class="bell-body">
        <path d="M184 75V32q0-13 13-13h32q13 0 13 13v43" fill="none" stroke="#7b4e29" stroke-width="6"/>
        <path d="M185 73V32q0-12 12-12h32q12 0 12 12v41" fill="none" stroke="#c2955c" stroke-width="2.5"/>
        <path d="M169 80h88l7 9H161Z" fill="url(#brass)" stroke="#d5a363"/>
        <g class="bell-swing">
          <circle cx="213" cy="34" r="4" fill="url(#brass)"/>
          <path d="M193 66c6-6 5-15 8-21 2-5 6-7 12-7s10 2 12 7c3 6 2 15 8 21Z" fill="url(#brass)" stroke="#eac276"/>
          <path d="M191 66q22 4 44 0l3 5q-25 9-50 0z" fill="url(#brass)" stroke="#dbab65"/>
          <circle cx="213" cy="76" r="3.5" fill="#d79b53"/>
          <path d="M205 43q-5 7-6 16" fill="none" stroke="#ffe0a2" stroke-width="1.5"/>
        </g>
        <path class="solenoid" d="M241 52h14v11h-14z" fill="#5d4230" stroke="#ae825a"/><path d="M240 57h-8" stroke="#c3a17d" stroke-width="2"/>
      </g>
    </svg>`;
    return asset(active ? assets.boxActive : assets.boxIdle, fallback);
  }

  function installTheme() {
    if (!USE_PUBLIC_ASSETS) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = PUBLIC_THEME_PATH;
    document.head.append(link);
  }

  function audioPath(city) {
    return USE_PUBLIC_ASSETS && city.audioFile ? PUBLIC_AUDIO_BASE_PATH + city.audioFile : "";
  }

  window.PigeonData = { cities, assets, icon, asset, token, landmark, machine, installTheme, audioPath };
})();
