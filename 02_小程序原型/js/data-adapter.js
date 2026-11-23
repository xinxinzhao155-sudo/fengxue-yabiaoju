(function (root) {
  "use strict";

  const source = root.EscortSOP;
  const overrides = root.ESCORT_SHARED_DATA || {};
  const config = {
    xian: { short: "西安", theme: "copper", mark: "枣", code: "XIAN", site: "永宁门", ingredient: "红枣", landmarkName: "永宁门城楼", landmarkArt: "yongning" },
    wuhan: { short: "武汉", theme: "indigo", mark: "莲", code: "WUHAN", site: "汉阳门花园", ingredient: "莲子", landmarkName: "黄鹤楼", landmarkArt: "huanghelou" },
    nanchang: { short: "南昌", theme: "jade", mark: "圆", code: "NANCHANG", site: "万寿宫大戏台", ingredient: "桂圆", landmarkName: "万寿宫大牌坊", landmarkArt: "wanshou" },
    suzhou: { short: "苏州", theme: "olive", mark: "桂", code: "SUZHOU", site: "通贵桥", ingredient: "桂花", landmarkName: "寒山寺", landmarkArt: "hanshan" }
  };
  const aliases = { a: "xian", b: "wuhan", c: "nanchang", d: "suzhou" };
  const sopIcons = { tear: "deco_ticket_tear_line", steam: "easter_porridge_music_steam" };
  const illustrations = {
    escort: "portrait_escort", yongning: "landmark_yongning", huanghelou: "landmark_huanghelou",
    wanshou: "landmark_wanshou", hanshan: "landmark_hanshan",
    jujube: "token_jujube", lotus: "token_lotus", longan: "token_longan", osmanthus: "token_osmanthus",
    roundel: "step_roundel", record: "step_record", brazier: "step_brazier", rice: "step_rice",
    bianzhong: "icon_bianzhong", audioPlaque: "plaque_audio", landmarkPlaque: "plaque_landmark",
    routeLine: "action_route_line", windSnow: "action_wind_snow", box: "box_pigeon_idle",
    printing: "box_pigeon_printing", tangLock: "icon_tang_lock", tangSeal: "icon_tang_seal",
    bambooLetter: "icon_bamboo_letter", grainTicket: "icon_grain_ticket",
    flag: "flag_escort", accept: "flag_escort", bird: "bird_post",
    satchel: "nav_satchel", passport: "nav_passbook", register: "register_open",
    pick: "icon_pick", street: "action_route_line", plaque: "story_plaque",
    key: "icon_key", capo: "icon_capo", jar: "icon_jar", pouring: "jar_pouring",
    stamp: "icon_tang_seal", vest: "coat_escort", coat: "coat_escort",
    voice: "icon_voice", snow: "action_wind_snow", hearth: "hearth_scene",
    bell: "icon_bell", muted: "icon_bell"
  };
  const navArt = { home: "flag", xingnang: "satchel", feige: "bird", wendie: "passport" };
  const scenes = { winterPass: "crane-pass", filmA: "caravan", filmB: "flock", filmC: "arrival", filmD: "riverside-post", mountainRoad: "mountains", cranePass: "crane-pass", towerElevation: "elevation" };
  const cities = source.cities.map(base => {
    const shared = Array.isArray(overrides.cities) ? overrides.cities.find(item => item?.id === base.id) : null;
    const city = { ...base, ...config[base.id] };
    for (const field of ["name", "short", "location", "landmark", "route", "site", "token", "ingredient", "landmarkName"]) {
      if (typeof shared?.[field] === "string" && shared[field].trim()) city[field] = shared[field];
    }
    if (typeof shared?.icon === "string" && shared.icon.trim()) city.icon = shared.icon;
    return city;
  });

  function city(id) {
    return cities.find(item => item.id === id);
  }

  function scanCity(id) {
    return city(id) || city(aliases[id]) || cities.find(item => [item.short, item.name].some(name => root.EscortTraditional(name) === root.EscortTraditional(String(id))));
  }

  function art(key) {
    if (typeof overrides.icons?.[key] === "string" && overrides.icons[key]) return overrides.icons[key];
    if (Object.hasOwn(scenes, key)) return "assets/stone-blue/" + scenes[key] + ".webp";
    const nav = /^nav_(home|xingnang|feige|wendie)_(default|active)$/.exec(key);
    if (nav) return art(navArt[nav[1]]);
    if (Object.hasOwn(illustrations, key)) return "assets/stone-blue/icons/" + illustrations[key] + ".webp";
    if (Object.hasOwn(sopIcons, key)) return "assets/stone-blue/icons/" + sopIcons[key] + ".svg";
    if (key === "scan") return "assets/stone-blue/icons/icon_scan_checkin.svg";
    return "";
  }

  const post = {
    maxLength: 100,
    blocked: ["测试敏感词", "辱骂词", "代开发票"],
    tags: ["街巷问候", "今夜有歌", "一碗热粥", "同路相伴", "等你回信"],
    sources: { live: "现场", seed: "预录", reserve: "余温", emergency: "备用" }
  };

  root.EscortData = {
    cities, city, scanCity, art, post, ensemble: source.ensemble,
    gates: ["听音寻味", "火塘听曲", "落米成音"],
    roles: ["合唱", "派粥", "秩序"],
    shifts: ["第一轮", "第二轮", "候补轮"],
    rewardName: "四城限定风物伴手礼盒",
    audio: id => "assets/audio/" + id + "-ticket.wav",
    huntAudio: id => "assets/audio/" + id + "-hunt.wav"
  };
})(window);
