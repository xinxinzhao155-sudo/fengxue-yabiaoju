(function (root) {
  "use strict";

  const data = root.EscortData;
  const paths = {
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    book: '<path d="M6 3h12a2 2 0 0 1 2 2v16H6a3 3 0 0 1 0-6h14M6 3a3 3 0 0 0-3 3v12m5-10h7"/>',
    mountain: '<path d="m2 19 7-12 5 8 3-5 5 9H2Zm5-9 2 2 2-2"/>',
    lantern: '<rect x="6" y="5" width="12" height="13" rx="5"/><path d="M9 2h6m-3 0v3m0 13v4M10 8v7m4-7v7"/>',
    waves: '<path d="M2 8c4 0 4-3 8-3s4 3 8 3c2 0 3-.7 4-1.5M2 14c4 0 4-3 8-3s4 3 8 3c2 0 3-.7 4-1.5M2 20c4 0 4-3 8-3s4 3 8 3c2 0 3-.7 4-1.5"/>',
    sprout: '<path d="M12 21v-7m0 2C5 16 3 12 3 7c6 0 9 3 9 9Zm0-3c0-6 3-9 9-9 0 5-2 9-9 9ZM7 21h10"/>',
    pin: '<path d="M19 10c0 5-7 11-7 11s-7-6-7-11a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    mini: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 3v3"/>',
    sliders: '<path d="M4 7h5m4 0h7M4 17h9m4 0h3"/><circle cx="11" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
    refresh: '<path d="M19 10a7 7 0 1 0 .5 5M19 5v5h-5"/>',
    bird: '<path d="M5 15 2 12l5 .5C9 8 12 5 19 3c-.2 3-1 5-3 7 2-.3 4 .3 5 2l1 1-3 .7C17 18 11 20 5 18l-2 2 2-5Z"/><path d="M8 14c4 .5 6-1 8-4"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8m-7-4v12m0-12H8a2.5 2.5 0 1 1 2.5-2.5L12 8Zm0 0h4a2.5 2.5 0 1 0-2.5-2.5L12 8Z"/>',
    music: '<path d="M9 17V5l11-2v12M9 9l11-2"/><ellipse cx="6" cy="17" rx="3" ry="2"/><ellipse cx="17" cy="15" rx="3" ry="2"/>',
    flame: '<path d="M12 3c3 4 2 6 4 7l2-2c2 3 3 5 2 8a8 8 0 0 1-16-1c0-3 2-5 4-7 0 2 1 3 2 3 2-2 3-5 2-8Z"/>',
    radio: '<path d="M3 19h2v-3H3zm5 0h2v-6H8zm5 0h2V9h-2zm5 0h2V5h-2z" fill="currentColor" stroke="none"/>',
    wifi: '<path d="M3 9a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0m-9 3a4 4 0 0 1 6 0"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/>',
    battery: '<rect x="2" y="6" width="18" height="12" rx="2"/><path d="M22 10v4"/><rect x="4.5" y="8.5" width="13" height="7" rx="1" fill="currentColor" stroke="none"/>',
    profile: '<circle cx="12" cy="8" r="3"/><path d="M5 20v-2a7 7 0 0 1 14 0v2"/>',
    play: '<path d="M9 6v12l10-6Z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M9 6v12m6-12v12" stroke-width="2.5"/>'
  };

  function qr(code, label = "模拟二维码，现场操作请使用下方演示码") {
    return `<div class="qr" role="img" aria-label="${label}">${Array.from({ length: 169 }, (_, index) => {
      const x = index % 13;
      const y = Math.floor(index / 13);
      const inFinder = (x < 5 && y < 5) || (x > 7 && y < 5) || (x < 5 && y > 7);
      const fx = x % 8;
      const fy = y % 8;
      const finder = fx === 0 || fx === 4 || fy === 0 || fy === 4 || (fx === 2 && fy === 2);
      const dark = inFinder ? finder : ((index * 13) ^ (index >>> 1) ^ code.charCodeAt(index % code.length) * (index + 7)) % 5 < 2;
      return `<i${dark ? ' class="dark"' : ""}></i>`;
    }).join("")}</div>`;
  }

  const tabs = [
    { id: "home", glyph: "map", art: "home", label: "镖局", title: "风雪押镖局" },
    { id: "journey", glyph: "compass", art: "xingnang", label: "行囊", title: "押镖三关" },
    { id: "post", glyph: "mail", art: "feige", label: "飞鸽", title: "飞鸽传书匣" },
    { id: "passbook", glyph: "book", art: "wendie", label: "文牒", title: "押镖通关文牒" }
  ];

  function html(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function icon(name) {
    const art = Object.hasOwn(paths, name) ? paths[name] : paths.map;
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${art}</svg>`;
  }

  function image(key, className = "", alt = "") {
    const src = data.art(key);
    if (!src && key === "gorgonSeal") return '<span class="ingredient-seal" aria-label="芡实">芡</span>';
    if (!src && key === "peanutSeal") return '<span class="ingredient-seal" aria-label="花生仁">仁</span>';
    return src ? `<img class="art ${className}" src="${html(src)}" alt="${html(alt)}" decoding="async">` : "";
  }

  function asset(key, fallback = "map") {
    return `<span class="asset-icon">${icon(fallback)}${image(key)}</span>`;
  }

  function button(label, action, style = "primary", value = "") {
    return `<button type="button" class="button ${style}" data-action="${action}"${value ? ` data-value="${html(value)}"` : ""}>${label}</button>`;
  }

  function date(value) {
    return new Intl.DateTimeFormat("zh-Hans-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai" }).format(new Date(value));
  }

  function station(state) {
    return data.city(state.profile.stationId);
  }

  function progress(route) {
    return route.stampedAt ? 3 : route.heardAt ? 2 : route.hunt ? 1 : 0;
  }

  function heading(kicker, title, copy, scene) {
    return `<header class="page-heading ink-heading">${image(scene, "chapter-art")}<div><p class="eyebrow">${html(kicker)}</p><h2>${html(title)}</h2><p>${html(copy)}</p></div></header>`;
  }

  function empty(glyph, title, copy, action = "", art = "") {
    return `<div class="empty${art ? " illustrated-empty" : ""}"><span>${art ? asset(art, glyph) : icon(glyph)}</span><h3>${title}</h3><p>${copy}</p>${action}</div>`;
  }

  function filmOpening(look, city, route) {
    return `<section class="film-opening" aria-labelledby="hero-title">
      ${image("film" + look.toUpperCase(), "film-still")}
      <div class="film-titles"><p>大冰的小屋 · 腊八六城联动</p><h2 id="hero-title">风雪押镖局</h2><span>六城共熬一碗粥</span></div>
      <div class="film-entry"><button type="button" data-action="route" data-value="${html(city.id)}">${route.startedAt ? "继续本城押镖" : "领本城押镖令"} ${icon("arrow")}</button>
        <small>在门口木架领取实体文牒</small></div>
    </section>`;
  }

  const featuredRoutes = new Set(["changsha", "chengdu"]);

  function home(state, context) {
    const here = station(state);
    const route = state.routes[here.id];
    const collected = Number(Boolean(route.stampedAt)) + Object.keys(route.tickets).length;
    const opening = context?.look ? filmOpening(context.look, here, route) : `<section class="hero" aria-labelledby="hero-title">
      ${image(here.landscape || "winterPass", "hero-art")}
      <div class="hero-copy"><span class="hero-kicker">大冰的小屋 · 腊八六城联动</span><h2 id="hero-title">风雪押镖局</h2><p>六城共熬一碗粥</p></div>
    </section>`;
    const identity = `
    <section class="identity">
      <span class="avatar">${asset("escort", "profile")}</span>
      <div><strong>${html(state.profile.nickname)}</strong><span>${icon("pin")} ${html(here.name)} · 当前分舵</span></div>
      <div class="collect"><strong>${collected}<small> / 6</small></strong><span>文牒六格</span></div>
    </section>
    ${context?.look ? "" : `<section class="rack card"><div><h3>木架自助领牒</h3><p>请在门口木架取一份实体歌本文牒。</p></div><button type="button" class="text-button" data-action="route" data-value="${here.id}">${asset("accept", "arrow")} ${route.startedAt ? "继续押镖" : "领押镖令"}</button></section>`}`;
    const routes = `<section aria-labelledby="route-title" class="route-section">
      <div class="section-heading"><div><h2 id="route-title">六城接镖台</h2><p>一关一段歌，一城一味福粥</p></div></div>
      <div class="route-grid">${[...data.cities].sort((a, b) => Number(featuredRoutes.has(b.id)) - Number(featuredRoutes.has(a.id))).map(city => {
        const cityRoute = state.routes[city.id];
        const status = cityRoute.stampedAt ? "已钤印" : cityRoute.startedAt ? progress(cityRoute) + " / 3 关" : city === here ? "本城接镖" : "查看路线";
        return `<button class="route-card tone-${city.theme}" type="button" data-action="route" data-value="${city.id}">
          <span class="route-art" aria-hidden="true">${image(city.landscape || city.landmarkArt, city.landscape ? "route-landmark route-painting" : "route-landmark")}</span>
          <span class="route-card-top"><span class="route-status ${cityRoute.stampedAt ? "complete" : city === here ? "started" : ""}">${status}</span></span>
          <span class="route-card-bottom"><span class="route-emblem">${asset(city.icon, "sprout")}</span><span><strong>${html(city.name)}</strong><small>${html(city.landmarkName)} · ${html(city.ingredient)}</small></span></span>
        </button>`;
      }).join("")}</div>
    </section>`;
    return context?.look ? opening + routes + identity : routes + identity + opening;
  }

  function milestone(step) {
    const gateArt = ["record", "brazier", "rice"];
    return `<section class="progress card" aria-label="押镖进度 ${step}/3"><div class="progress-label"><strong>押镖三关</strong><span>${step} / 3</span></div><ol class="milestones">${data.gates.map((label, index) =>
      `<li class="${index < step ? "done" : index === step ? "current" : ""}"${index === step ? ' aria-current="step"' : ""}>
        <span class="milestone-number">${image("roundel")}<b>${index + 1}</b>${index < step ? `<i class="step-check" aria-label="已完成">${icon("check")}</i>` : ""}</span>
        ${image(gateArt[index], "milestone-art")}<small>${label}</small>
      </li>`).join("")}</ol></section>`;
  }

  function gateCard(art, title, content, variant = "") {
    return `<section class="encounter card ${variant}"><div class="gate-head">${asset(art, "compass")}<h3>${title}</h3></div>${content}</section>`;
  }

  function player(src, label) {
    return `<audio controls preload="none" aria-label="${html(label)}" src="${html(src)}"></audio>`;
  }

  function huntPlayer(city) {
    return `<div class="audio-plaque">
      ${image("audioPlaque", "audio-plaque-art")}
      <span class="plaque-title">${html(city.sound)}</span>
      <div class="plaque-controls">
        <button class="plaque-play icon-button" type="button" data-action="hunt-audio" aria-label="播放寻味音轨">${icon("play")}</button>
        <input type="range" id="hunt-seek" min="0" max="15" step="0.1" value="0" aria-label="寻味音轨进度">
        <span class="plaque-time">0:00 / 0:15</span>
      </div>
      <audio id="hunt-audio" preload="metadata" src="${html(data.huntAudio(city.id))}" aria-label="${html(city.sound)} · 15 秒演示音轨"></audio>
    </div>`;
  }

  function huntGate(city) {
    return gateCard("bianzhong", "听音寻味", `${huntPlayer(city)}
      <p class="track-note">15 秒演示音轨</p>
      <div class="hunt-directions">
        <div class="landmark-rule"><h4 class="landmark-plaque">${image("landmarkPlaque")}<span>${html(city.site)}</span></h4></div>
        <p>${html(city.route)}</p><small>${city.landscape ? "本版采用城景模拟寻味，实际门店路线待确认。" : "门店实测约 150～200 米、步行 2～3 分钟。现场在 200 米围栏内打开拨片框。"}</small>
      </div>
      <div class="hunt-actions">
        <button type="button" data-action="hunt-location">${image("routeLine")}<span>模拟到达地标</span></button>
        <button type="button" data-action="weather">${image("windSnow")}<span>风雪免行</span></button>
      </div>`, "hunt-gate");
  }

  function listenGate(city) {
    return gateCard("plaque", "火塘听曲", `<p>听驻唱讲「${html(city.storyTitle)}」并唱${html(city.oldSong)}。错过演出可碰 NFC 或扫墙角的留声木牌。</p>
      <details class="transcript"><summary>读留声木牌口述稿 ${icon("down")}</summary>${city.story.map(paragraph => `<p>${html(paragraph)}</p>`).join("")}</details>
      <form id="answer-form"><label for="answer">故事里提到的信物是什么？</label><input id="answer" name="answer" maxlength="30" autocomplete="off" placeholder="输入一个关键词" aria-describedby="answer-error"><p id="answer-error" class="form-error" role="status"></p><button type="submit" class="button primary full">${asset("key", "lock")} 核验暗号</button></form>`);
  }

  function riceGate(route) {
    return gateCard(route.pouredAt ? "pouring" : "jar", "落米成音", `<ol class="gate-steps"><li>用红绳木勺舀一勺五谷，听米落进百家陶缸。</li><li>将吉他大印蘸上朱砂，盖在实体文牒的本城格，再把印章放回原处。</li><li>扫米缸木牌，激活飞鸽传书匣。</li></ol>
      ${route.pouredAt ? button("模拟扫米缸木牌", "stamp", "primary full") : button("我已添米并盖好印", "pour", "primary full")}`);
  }

  function songbook(city, route) {
    return `<section class="journal"><div class="section-heading"><h3>我的行囊</h3></div>
      ${route.hunt ? `<details class="journal-item card"><summary>${asset(city.icon, "sprout")}<span>${html(city.token)} · 寻味海报</span>${icon("down")}</summary><div class="journal-content">${poster(city, route.hunt.image)}</div></details>` : ""}
      ${route.heardAt ? `<details class="journal-item card"><summary>${asset("capo", "music")}<span>和弦音轨与本城歌谱</span>${icon("down")}</summary><div class="journal-content"><p>${html(city.track)}</p>${player(data.audio(city.id), "本城和弦演示")}<blockquote>${html(city.ticket.line)}</blockquote><code>${html(city.ticket.notes)}</code>${songLines([...city.verse, ...city.chorus])}</div></details>` : ""}
    </section>`;
  }

  function songLines(lines) {
    return `<div class="song-lines">${lines.map(line => `<p>${html(line).replace(/\[([A-Za-z0-9#♭]+)\]/g, "<b>$1</b>")}</p>`).join("")}</div>`;
  }

  function journey(state) {
    const city = station(state);
    const route = state.routes[city.id];
    if (!route.startedAt) {
      return heading(city.name + " · 本城分舵", "押镖三关", "在门口木架扫码，领一份唱得出来的文牒。", city.landscape || "cranePass") +
        empty("compass", "等待领令", "先接本城的镖，沿途拾取风物音符。", button("查看本城押镖令", "route", "primary", city.id), "satchel");
    }
    const step = progress(route);
    const gates = [
      () => huntGate(city),
      () => listenGate(city),
      () => riceGate(route),
      () => gateCard("stamp", "本城印已入牒", `<p>飞鸽匣已激活。给异城寄出一段声音，再收齐五座异城的粮票。</p>${button("去飞鸽传书匣", "post", "primary full")}`)
    ];
    return heading(city.name + " · " + city.ingredient, "押镖三关", "听一段街声、记一个暗号、盖一枚本城印。", city.landscape || "cranePass") +
      milestone(step) + gates[step]() + (step ? songbook(city, route) : "");
  }

  function audioUrl(clip) {
    if (clip?.kind === "demo" && data.city(clip.cityId)) return data.audio(clip.cityId);
    return clip?.kind === "recorded" ? clip.dataUrl : "";
  }

  function letterForm(state, context) {
    const city = station(state);
    const draft = context.draft;
    const clip = audioUrl(draft.audio);
    return `<form id="letter-form" class="letter card">
      <div class="card-heading"><h3>寄一张民谣粮票</h3><span class="small-tag">${html(city.token)}</span></div>
      ${draft.replyTo ? `<div class="reply-banner">回信给 ${html(draft.replyAuthor)} <button type="button" class="text-button" data-action="cancel-reply">取消</button></div>` : ""}
      <label for="destination">投递分舵</label><select name="destination" id="destination" ${draft.replyTo ? "disabled" : ""}>
        <option value="random">随机漂流</option>${data.cities.filter(item => item.id !== city.id).map(to => `<option value="${to.id}" ${to.id === draft.to ? "selected" : ""}>${html(to.name)}</option>`).join("")}</select>
      <div class="themes" role="group" aria-label="信笺主题">${data.post.tags.map((tag, index) => `<button type="button" class="chip" aria-pressed="${index === draft.preset}" data-action="tag" data-value="${index}">${tag}</button>`).join("")}</div>
      <div class="letter-label"><label for="letter-body">粮票寄语</label><button type="button" class="text-button" data-action="preset">填入本城寄语</button></div>
      <textarea id="letter-body" name="body" rows="3" aria-describedby="letter-count letter-error" placeholder="写给异城的同路人……">${html(draft.body)}</textarea>
      <div class="letter-meta"><span id="letter-error" role="status"></span><output id="letter-count" for="letter-body">${Array.from(draft.body).length} / 100</output></div>
      <section class="voice-block" aria-labelledby="voice-title">
        <div class="card-heading"><h4 id="voice-title">${asset("voice", "music")} 随票声音 · 10 秒</h4>${clip ? `<button type="button" class="text-button" data-action="clear-audio">移除</button>` : ""}</div>
        ${context.recording ? '<p role="status">正在录音，10 秒后自动结束。</p>' : ""}
        ${clip ? `<p>${draft.audio.kind === "demo" ? "本城演示音轨 · 预录" : "现场录音 · 现场"}</p>${player(clip, "预听随票声音")}` :
          `<div class="two-actions"><button class="button light" type="button" data-action="record" ${context.recording ? "disabled" : ""}>录 10 秒现场声</button>${button("使用演示音轨", "demo-audio", "light")}</div>`}
        <label class="consent"><input type="checkbox" name="consent" id="audio-consent" ${draft.consent ? "checked" : ""}> 我同意将寄语和所选声音送往异城，已征得可辨识录音参与者同意。</label>
      </section>
      <button type="submit" class="button primary full">${asset("bird", "bird")} 放飞信鸽</button>
    </form>`;
  }

  function post(state, context) {
    const city = station(state);
    const route = state.routes[city.id];
    const incoming = state.incoming.filter(letter => letter.toCityId === city.id).slice().reverse();
    const outgoing = state.outgoing.filter(letter => letter.fromCityId === city.id).slice().reverse();
    const inbox = context.mailTab === "in";
    const mailbox = inbox ? incoming : outgoing;
    return heading(city.name + " · 异城投递", "飞鸽传书匣", "木匣响铃，撕票贴牒，扫码听见异城的十秒。", "filmB") +
      `<div class="box-status card" id="box-status">${asset("box", "mail")}<div><strong>吧台旁的飞鸽木匣</strong><p>响铃后，从出纸口取票。</p></div></div>` +
      (route.stampedAt ? letterForm(state, context) :
        empty("lock", "传书匣待激活", "完成落米成音，扫过米缸木牌再寄信。", button("回到押镖三关", "journey"), "tangLock")) +
      `<section class="mailbox"><div class="section-heading"><h3>粮票信箱</h3>
        ${route.stampedAt ? `<button type="button" class="text-button" data-action="backup">余温与备用票 ${icon("arrow")}</button>` : ""}</div>
        <div class="segmented" aria-label="信箱分类"><button type="button" data-action="mail-in" aria-pressed="${inbox}">收件箱 ${incoming.length}</button><button type="button" data-action="mail-out" aria-pressed="${!inbox}">发件箱 ${outgoing.length}</button></div>
        ${mailbox.length ? `<ul class="mail-list">${mailbox.map(item => {
          const other = data.city(inbox ? item.fromCityId : item.toCityId);
          const kept = inbox && route.tickets[item.fromCityId]?.id === item.id;
          return `<li><button class="mail-row card" type="button" data-action="letter" data-box="${inbox ? "in" : "out"}" data-value="${html(item.id)}"><span class="mail-icon">${asset(kept ? "stamp" : "box", "mail")}</span><span><strong>${html(other.short)} · ${kept ? "已贴牒" : data.post.sources[item.source]} ${inbox && !item.readAt ? '<i class="unread" aria-label="未读"></i>' : ""}</strong><small>${html(item.body)}</small></span>${icon("chevron")}</button></li>`;
        }).join("")}</ul>` : empty("mail", inbox ? "木匣还没有来信" : "还没有寄出的粮票", inbox ? "听到铜铃后，记得去木匣取票。" : "寄过的粮票会留在发件箱。", "", inbox ? "bambooLetter" : "grainTicket")}
      </section>`;
  }

  function qualified(route) {
    return Boolean(route.stampedAt && Object.keys(route.tickets).length === data.cities.length - 1);
  }

  function passbook(state, context) {
    const city = station(state);
    const route = state.routes[city.id];
    const count = Number(Boolean(route.stampedAt)) + Object.keys(route.tickets).length;
    const redemption = route.redemption;
    return heading(city.name + " · 实体文牒六格", "押镖通关文牒", "一枚本城朱印，五张不同异城的民谣粮票。", "filmC") +
      `<div class="section-heading pass-heading"><h3>六城文牒</h3><span class="small-tag">${count} / 6 已入牒</span></div>
      <div class="stamp-grid">${data.cities.map(other => {
        const local = other.id === city.id;
        const ticket = route.tickets[other.id];
        const filled = local ? route.stampedAt : ticket;
        const illustration = other.id === "xian" ? "tangSeal" : other.landmarkArt;
        const imageLabel = other.id === "xian" ? "唐式铜印" : other.landmarkName;
        return `<article class="stamp-card ${filled ? "unlocked" : ""}">
          <span class="passbook-emblem ${context.stamp === other.id ? "stamp-in" : ""}">${image(illustration, "", imageLabel)}${filled ? `<i class="passbook-check" aria-label="已入牒">${icon("check")}</i>` : ""}</span>
          <strong>${html(other.name)}</strong><small>${local ? (filled ? "本城朱印" : "待本城钤印") : (ticket ? data.post.sources[ticket.source] + "粮票" : "待异城粮票")}</small></article>`;
      }).join("")}</div>
      <section class="redemption"><div class="section-heading"><div><h3>晋升金牌总镖头</h3><p>齐牒后请到吧台出示凭证</p></div>${asset("vest", "gift")}</div>
      ${redemption ? `<article class="reward card"><div class="card-heading"><h4>${data.rewardName}</h4><span class="small-tag green">已核销</span></div>
        <p>${redemption.fulfillment === "collected" ? "礼盒已领取" : redemption.fulfillment === "registered" ? "补发已登记 · 等待门店发货" : "礼盒待顺丰包邮补发"} · ${date(redemption.redeemedAt)}</p>
        ${redemption.fulfillment === "pending" ? button("登记顺丰包邮补发", "shipment", "light full") : ""}
        ${route.signup ? `<div class="redeemed-line">${icon("check")} ${html(route.signup.role)} · ${html(route.signup.shift)} · ${route.signup.shift === "候补轮" ? "候补已登记" : "演示报名已登记"}</div>` : button("报名腊八红马甲施粥", "signup", "primary full")}</article>` :
        qualified(route) ? `<article class="reward card"><h4>${data.rewardName}</h4><p>请带上已盖印、贴票的实体文牒。</p>${button("出示吧台核销码", "redeem", "primary full")}</article>` :
        empty("lock", "六格未齐", "盖好本城印，再贴入来自不同异城的五张粮票。", button("去粮票信箱", "post", "light"), "tangLock")}
      </section>
      <details class="journal-item card ensemble"><summary>${asset("snow", "music")}<span>六城合奏 · ${html(data.ensemble.title)}</span>${icon("down")}</summary><div class="journal-content">
        <p>${html(data.ensemble.arrangement)}</p>${songLines(data.ensemble.common)}</div></details>`;
  }

  function demo(state) {
    return `<label for="demo-shop">当前绑定分舵</label><div class="demo-select">${icon("pin")}<select id="demo-shop">${data.cities.map(city => `<option value="${city.id}" ${state.profile.stationId === city.id ? "selected" : ""}>${html(city.name)}</option>`).join("")}</select></div>
      <div class="demo-actions">
        ${[["demo-unlock", asset("tangSeal", "compass"), "快进六城三关", "领令、寻味、对暗号、钤印"], ["demo-letter", asset("box", "mail"), "模拟异城木匣来票", "向当前分舵送一张预录粮票"],
          ["demo-three", asset("grainTicket", "book"), "补齐五城来票", "发到收件箱，逐张贴入文牒"], ["demo-reset", icon("refresh"), "重置本地存档", "清除本轮的进度与往来粮票"]]
          .map(([action, glyph, title, copy]) => `<button type="button" data-action="${action}">${glyph}<span>${title}<small>${copy}</small></span>${icon("chevron")}</button>`).join("")}
      </div>
      <label class="consent demo-stock"><input type="checkbox" id="demo-stock" ${state.demoStock ? "checked" : ""}> 模拟礼盒有货</label>`;
  }

  function routeSheet(city, state) {
    const ours = station(state) === city;
    return `<div class="route-sheet-lead tone-${city.theme}${city.posterArt ? " canal-sheet" : ""}"><div><p class="eyebrow">${html(city.location)}</p><h2 id="sheet-title">${html(city.name)}</h2><span class="route-specimen">${image(city.icon)} ${html(city.ingredient)}</span></div>${image(city.landmarkArt, city.landscape ? "sheet-landmark city-portrait" : "sheet-landmark", city.landmarkName)}</div>
      <dl class="route-detail"><div><dt>本城风物</dt><dd><strong>${html(city.token)}</strong><p>${html(city.sound)}</p></dd></div><div><dt>寻味地标</dt><dd>${html(city.landmark)}<p>${html(city.route)}</p></dd></div></dl>
      ${ours ? `<button class="fx-button route-accept" type="button" data-action="accept">${state.routes[city.id].startedAt ? "继续本城押镖" : "揭榜领取押镖令"}</button><p class="sheet-tip">请在门口木架另取一份实体文牒。</p>` :
        `<p class="sheet-copy">当前绑定${html(station(state).name)}。这座城的粮票可在飞鸽匣收取。</p><a class="button primary full" href="?station=${encodeURIComponent(city.id)}">切换到${html(city.short)}演示</a>`}`;
  }

  function poster(city, photo = "") {
    return `<div class="hunt-poster">
      ${photo ? `<img class="hunt-photo" src="${html(photo)}" alt="本次寻味照片">` : city.posterArt ? image(city.posterArt, "hunt-photo", city.landmarkName) : image("pick", "pick-art")}
      <span class="poster-mark">风雪押镖 · 已寻味</span><strong>${html(city.frame)}</strong><small>${html(city.name)} · ${html(city.site)}</small>
    </div>`;
  }

  function huntSheet(city, mode, photo) {
    return `<p class="eyebrow">${html(city.site)} · ${mode === "weather" ? "风雪免行" : "模拟到达"}</p><h2 id="sheet-title">吉他拨片取景框</h2>
      <p class="sheet-copy">${mode === "weather" ? "请站在门口安全处，对准风物立牌。" : "请站在开放步行区，对准古建。"}原型支持选取相片，也可以用示意图走通。</p>
      <div id="snapshot">${poster(city, photo)}</div><label class="button light photo-picker">拍照或选图<input id="hunt-photo" type="file" accept="image/*" capture="environment" aria-describedby="photo-error"></label><p class="form-error" id="photo-error" role="status"></p>
      ${button("保存寻味海报 · 解锁风物音符", "finish-hunt", "primary full")}`;
  }

  function heardSheet(city) {
    return `<p class="eyebrow">${html(city.name)} · 暗号核验通过</p><h2 id="sheet-title">收下这一城的和弦</h2>
      <div class="fx-story-card"><p class="fx-story-card__title">${html(city.storyTitle)}</p><p class="fx-story-card__code">${html(city.frame)}</p><p class="fx-story-card__body">${html(city.ticket.notes)}</p></div>
      <p class="sheet-copy">${html(city.track)}</p>${player(data.audio(city.id), "本城和弦演示")}${button("继续落米成音", "close", "primary full")}`;
  }

  function letterSheet(state, letter, inbox) {
    const from = data.city(letter.fromCityId);
    const to = data.city(letter.toCityId);
    const route = state.routes[state.profile.stationId];
    const kept = route.tickets[from.id];
    const clip = audioUrl(letter.audio);
    return `<p class="eyebrow">${html(from.short)} → ${html(to.short)} · ${date(letter.createdAt)}</p>
      <h2 id="sheet-title">${html(from.token)} · 民谣粮票</h2>
      <article class="grain-ticket"><div class="card-heading">${asset(from.icon, "music")}<strong>${html(from.site)}</strong><span class="small-tag">${data.post.sources[letter.source]}</span></div>
        <code>${html(from.ticket.notes)}</code><blockquote>${html(from.ticket.line)}</blockquote>${image("tear", "ticket-divider")}
        <p>${html(letter.body)}</p><small>${html(letter.author)} · ${html(letter.tag)}</small>
        <div class="wave-code">${qr(letter.id, "演示声波码")}<span>${asset("voice", "music")} 票面声波码 · 演示</span></div>
        ${clip ? player(clip, "扫码听随票十秒") : '<p class="form-error">此票暂无原声音轨。</p>'}
      </article>
      ${inbox ? `<div class="two-actions">${button(letter.resonatedAt ? "共鸣印已点亮" : "点亮共鸣火漆印", "resonate", "light", letter.id)}
        ${route.stampedAt ? button("回信", "reply", "light", letter.id) : ""}</div>
        ${route.stampedAt ? kept ? '<p class="sheet-tip">这一城的粮票已入牒。</p>' : button("模拟扫码 · 贴入文牒", "collect-ticket", "primary full collect-ticket", letter.id) : '<p class="sheet-tip">请先完成本城钤印，再贴粮票。</p>'}` : button("收好粮票", "close", "primary full")}`;
  }

  function credentialSheet(city, credential, stock) {
    return `<p class="eyebrow">${html(city.name)} · 吧台核销</p><h2 id="sheet-title">晋升金牌总镖头</h2>
      <div class="credential-card"><h3>${data.rewardName}</h3><p>吧台查看实体文牒的一枚本城印和五张异城票。</p>${qr(credential.code)}<span class="code">${html(credential.code)}</span>
        <div class="credential-meta"><span id="countdown"></span><button type="button" class="text-button" data-action="rotate-code">${icon("refresh")} 刷新码</button></div></div>
      <form id="redeem-form" data-credential="${html(credential.id)}"><label for="staff-pin">店员演示口令</label><input id="staff-pin" name="pin" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="2026" aria-describedby="redeem-error"><p class="form-error" id="redeem-error" role="status"></p>
        <button class="button primary full" type="submit">${stock ? "确认核销 · 发放礼盒" : "确认核销 · 礼盒待补发"} ${icon("check")}</button></form>`;
  }

  root.EscortViews = {
    html, icon, image, asset, button, tabs, home, journey, post, passbook, demo, station,
    qualified, routeSheet, huntSheet, poster, heardSheet, letterSheet, credentialSheet
  };
})(window);
