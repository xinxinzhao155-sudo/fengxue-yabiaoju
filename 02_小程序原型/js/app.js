(function (root) {
  "use strict";

  const data = root.EscortData;
  const store = root.EscortStore;
  const view = root.EscortViews;
  const screen = document.querySelector("#screen");
  const tabs = document.querySelector("#tabs");
  const phone = document.querySelector(".phone");
  const sheet = document.querySelector("#sheet");
  const toast = document.querySelector("#toast");
  const flight = document.querySelector("#flight");
  const demo = document.querySelector("#demo-controls");
  const defaultDraft = () => ({ to: "random", preset: 0, body: "", replyTo: null, replyAuthor: null, audio: null, consent: false });
  const context = { page: "home", mailTab: "in", draft: defaultDraft(), recording: false, stamp: null };
  const look = new URLSearchParams(root.location.search).get("look");
  if (["a", "b", "c", "d"].includes(look)) {
    context.look = look;
    document.documentElement.dataset.look = look;
  }
  const credentialSeconds = 90;
  const staffPin = "2026";
  let hunt = null;
  let bellContext = null;
  let boxTimer;
  let stopRecording = null;
  let toastTimer;
  let flightTimer;
  let codeTimer;
  let activeCredential = null;
  let returnFocus = null;

  const now = () => new Date().toISOString();
  const button = (label, action, style = "primary") => `<button class="button ${style}" type="button" data-action="${action}">${label}</button>`;

  function render({ jump = false, retainInput = false } = {}) {
    const state = store.load();
    const scroll = screen.scrollTop;
    const oldInput = document.activeElement;
    const restoreDraftFocus = retainInput && oldInput?.id === "letter-body";
    if (context.draft.to === state.profile.stationId) {
      context.draft = { ...defaultDraft(), body: context.draft.body, preset: context.draft.preset };
    }
    const openedJournal = context.page === "journey" ? [...screen.querySelectorAll(".journal-item")].map(item => item.open) : [];
    screen.innerHTML = view[context.page](state, context);
    if (context.page === "passbook") context.stamp = null;
    screen.scrollTop = jump ? 0 : scroll;
    if (!jump) screen.querySelectorAll(".journal-item").forEach((item, index) => { item.open = Boolean(openedJournal[index]); });
    if (restoreDraftFocus) {
      const input = screen.querySelector("#letter-body");
      if (input) {
        input.focus({ preventScroll: true });
        input.setSelectionRange(oldInput.selectionStart, oldInput.selectionEnd);
      }
    }
    const tabInfo = view.tabs.find(tab => tab.id === context.page);
    document.querySelector("#mini-title").textContent = tabInfo.title;
    document.querySelector(".mini-back").hidden = context.page === "home";
    for (const tab of tabs.querySelectorAll("button")) {
      const current = tab.dataset.action === context.page;
      if (current) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
      const item = view.tabs.find(entry => entry.id === tab.dataset.action);
      const glyph = tab.querySelector(".tab-art");
      const assetKey = item.art + (current ? "_active" : "_default");
      if (glyph.dataset.state !== assetKey) {
        glyph.dataset.state = assetKey;
        glyph.innerHTML = view.asset("nav_" + assetKey, item.glyph);
      }
    }
    if (demo.querySelector("select")?.value !== state.profile.stationId) demo.innerHTML = view.demo(state);
    const sound = document.querySelector("#sound-control");
    if (!sound.firstElementChild || sound.getAttribute("aria-pressed") !== String(state.sound)) {
      sound.setAttribute("aria-pressed", String(state.sound));
      sound.innerHTML = view.asset(state.sound ? "bell" : "muted", "music");
    }
    const stock = document.querySelector("#demo-stock");
    if (stock) stock.checked = state.demoStock;
    document.querySelector("#save-note").textContent = store.persisted() ? "演示进度保存在当前浏览器" : "本地存储不可用，进度仅保留在当前页面";
  }

  function go(page, focus = false) {
    const jump = context.page !== page;
    if (jump && page !== "post") stopRecording?.();
    context.page = page;
    render({ jump });
    if (jump) {
      screen.classList.remove("enter");
      void screen.offsetWidth;
      screen.classList.add("enter");
    }
    if (focus) screen.focus({ preventScroll: true });
  }

  function notify(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("visible");
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 3600);
  }

  function layoutSheet() {
    const { left, width, bottom } = phone.getBoundingClientRect();
    sheet.style.setProperty("--sheet-left", left + width / 2 + "px");
    sheet.style.setProperty("--sheet-width", width + "px");
    sheet.style.setProperty("--sheet-bottom", Math.max(0, window.innerHeight - bottom) + "px");
  }

  function openSheet(content) {
    clearInterval(codeTimer);
    activeCredential = null;
    layoutSheet();
    if (!sheet.open) returnFocus = document.activeElement;
    sheet.innerHTML = `<div class="sheet-content"><div class="sheet-handle" aria-hidden="true"></div><button class="icon-button sheet-close" data-action="close" type="button" aria-label="关闭弹窗">${view.icon("close")}</button>${content}</div>`;
    if (!sheet.open) sheet.showModal();
    const heading = sheet.querySelector("#sheet-title");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }

  function closeSheet() {
    if (sheet.open) sheet.close();
  }

  sheet.addEventListener("close", () => {
    if (sheet.open) return;
    clearInterval(codeTimer);
    activeCredential = null;
    hunt = null;
    const target = returnFocus?.isConnected && returnFocus !== document.body ? returnFocus : screen;
    target.focus({ preventScroll: true });
    returnFocus = null;
  });
  sheet.addEventListener("click", event => {
    if (event.target === sheet) {
      const rect = sheet.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeSheet();
    }
  });

  function ourRoute(state) {
    return state.routes[state.profile.stationId];
  }

  function toggleHuntAudio(control) {
    const audio = control.closest(".audio-plaque").querySelector("audio");
    if (audio.paused) {
      void audio.play().catch(error => {
        if (audio.isConnected && error.name !== "AbortError") notify("暂时无法播放寻味音轨");
      });
    } else {
      audio.pause();
    }
  }

  function updateHuntAudio(event) {
    const audio = event.target;
    if (audio.id !== "hunt-audio" || !audio.isConnected) return;
    const plaque = audio.closest(".audio-plaque");
    const play = plaque.querySelector(".plaque-play");
    const playing = !audio.paused && !audio.ended;
    const label = playing ? "暂停寻味音轨" : "播放寻味音轨";
    if (play.getAttribute("aria-label") !== label) {
      play.setAttribute("aria-label", label);
      play.innerHTML = view.icon(playing ? "pause" : "play");
    }
    const seek = plaque.querySelector("#hunt-seek");
    const duration = Number.isFinite(audio.duration) ? audio.duration : 15;
    const format = seconds => "0:" + String(Math.floor(seconds)).padStart(2, "0");
    seek.max = duration;
    seek.value = audio.currentTime;
    seek.setAttribute("aria-valuetext", format(audio.currentTime) + " / " + format(duration));
    plaque.querySelector(".plaque-time").textContent = seek.getAttribute("aria-valuetext");
  }

  function accept() {
    store.update(state => { ourRoute(state).startedAt ||= now(); });
    closeSheet();
    go("journey", true);
    notify("已领押镖令 · 记得自取实体文牒");
  }

  function beginHunt(mode) {
    const state = store.load();
    const route = ourRoute(state);
    if (!route.startedAt || route.hunt) return;
    hunt = { mode, photo: "", cityId: state.profile.stationId };
    openSheet(view.huntSheet(view.station(state), mode, hunt.photo));
  }

  function weather() {
    const city = view.station(store.load());
    openSheet(`<p class="eyebrow">${view.html(city.name)} · 风雪免行</p><h2 id="sheet-title">在小屋门口寻味</h2><p class="sheet-copy">风雪或定位漂移时，扫门口老街风物立牌。也可以输入立牌口令，演示口令为 FX-${city.code}。</p>
      <form id="weather-form"><label for="weather-code">路牌口令</label><input id="weather-code" name="code" autocomplete="off" aria-describedby="weather-error"><p class="form-error" id="weather-error" role="status"></p><button type="submit" class="button primary full">打开拨片框</button></form>`);
  }

  function verifyWeather(form) {
    const expected = "FX-" + view.station(store.load()).code;
    if (form.elements.code.value.trim().toUpperCase() === expected) beginHunt("weather");
    else form.querySelector("#weather-error").textContent = "口令有误，请核对门口立牌。";
  }

  async function loadPhoto(input) {
    const file = input.files[0];
    const attempt = hunt;
    if (!file || !attempt) return;
    const error = sheet.querySelector("#photo-error");
    const confirm = sheet.querySelector('[data-action="finish-hunt"]');
    if (file.size > 20 * 1024 * 1024) {
      error.textContent = "请选 20 MB 以内的照片。";
      return;
    }
    confirm.disabled = true;
    const source = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = source;
      await image.decode();
      if (hunt !== attempt || !sheet.open) return;
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 600 / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      attempt.photo = canvas.toDataURL("image/jpeg", 0.72);
      if (attempt.photo.length > 180000) {
        attempt.photo = canvas.toDataURL("image/jpeg", 0.38);
      }
      sheet.querySelector("#snapshot").innerHTML = view.poster(data.city(attempt.cityId), attempt.photo);
      error.textContent = "";
    } catch {
      if (hunt === attempt) error.textContent = "这张照片无法预览，可换一张或用示意图继续。";
    } finally {
      URL.revokeObjectURL(source);
      if (hunt === attempt) confirm.disabled = false;
    }
  }

  function finishHunt() {
    if (!hunt) return;
    const result = store.update(state => {
      const route = ourRoute(state);
      if (state.profile.stationId !== hunt.cityId || !route.startedAt || route.hunt) return false;
      route.hunt = { mode: hunt.mode, image: hunt.photo, completedAt: now() };
      return true;
    });
    closeSheet();
    if (result) {
      go("journey", true);
      notify("已寻味 · " + view.station(store.load()).token + "音符入囊");
    }
  }

  function normalizeAnswer(value) {
    return root.EscortTraditional(value.normalize("NFKC")).toLowerCase().replace(/[\p{P}\p{Z}\s]/gu, "");
  }

  function verifyAnswer(form) {
    const answer = normalizeAnswer(form.elements.answer.value);
    const city = view.station(store.load());
    if (!city.answers.some(candidate => normalizeAnswer(candidate) === answer)) {
      form.querySelector("#answer-error").textContent = answer ? "还差一点，回听故事里的那件信物。" : "请填写故事里听到的信物。";
      form.elements.answer.focus();
      return;
    }
    if (store.update(state => {
      const route = ourRoute(state);
      if (state.profile.stationId !== city.id || !route.hunt || route.heardAt) return false;
      route.heardAt = now();
      return true;
    })) {
      render();
      openSheet(view.heardSheet(city));
    }
  }

  function pour() {
    if (store.update(state => {
      const route = ourRoute(state);
      if (!route.heardAt || route.pouredAt) return false;
      route.pouredAt = now();
      return true;
    })) {
      render();
      notify("添米和实体钤印已记录 · 接着扫米缸木牌");
    }
  }

  function stamp() {
    const stamped = store.update(state => {
      const route = ourRoute(state);
      if (!route.pouredAt || route.stampedAt) return false;
      route.stampedAt = now();
      return state.profile.stationId;
    });
    if (stamped) {
      context.stamp = stamped;
      render();
      openSheet(`<div class="ceremony"><span class="stamp-mark inked stamp-in">${view.html(data.city(stamped).mark)}</span><p class="eyebrow">本城朱印已入牒</p><h2 id="sheet-title">飞鸽匣开了</h2><p>下一程，给异城寄去十秒声音。</p>${button("去飞鸽传书匣", "post")}</div>`);
    }
  }

  function setDraftBody(textarea, content) {
    if (!textarea) return;
    const body = Array.from(content).slice(0, data.post.maxLength).join("");
    if (textarea.value !== body) textarea.value = body;
    context.draft.body = body;
    document.querySelector("#letter-count").value = Array.from(body).length + " / " + data.post.maxLength;
    document.querySelector("#letter-error").textContent = "";
    textarea.removeAttribute("aria-invalid");
  }

  function animateFlight() {
    clearTimeout(flightTimer);
    flight.hidden = true;
    void flight.offsetWidth;
    flight.hidden = false;
    flightTimer = setTimeout(() => { flight.hidden = true; }, 950);
  }

  function ring() {
    if (!store.load().sound || !root.AudioContext) return;
    try {
      bellContext ||= new AudioContext();
      void bellContext.resume().catch(() => {});
      const start = bellContext.currentTime;
      for (const [frequency, volume, duration] of [[659, .065, .55], [1633, .025, .42], [2277, .013, .28]]) {
        const tone = bellContext.createOscillator();
        const gain = bellContext.createGain();
        tone.frequency.value = frequency;
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
        tone.connect(gain).connect(bellContext.destination);
        tone.start(start);
        tone.stop(start + duration);
      }
    } catch {
      // A muted or unavailable audio device must not interrupt receipt.
    }
  }

  function animateBox() {
    const box = document.querySelector("#box-status");
    if (!box) return;
    clearTimeout(boxTimer);
    box.classList.add("printing");
    box.firstElementChild.outerHTML = view.asset("printing", "mail");
    box.querySelector("p").textContent = "铃响了 · 木匣正在吐出粮票。";
    boxTimer = setTimeout(() => {
      box.classList.remove("printing");
      box.firstElementChild.outerHTML = view.asset("box", "mail");
      box.querySelector("p").textContent = "取下粮票，扫票听异城声音。";
    }, 1600);
  }

  function resetAudioConsent() {
    context.draft.consent = false;
    context.draft.audio = null;
  }

  function encodeAudio(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  async function recordAudio() {
    if (context.recording || !root.navigator.mediaDevices?.getUserMedia || !root.MediaRecorder) {
      if (!context.recording) notify("当前浏览器无法录音，请选演示音轨");
      return;
    }
    const draft = context.draft;
    context.recording = true;
    render();
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 }, video: false });
      if (draft !== context.draft || context.page !== "post") return;
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"].find(type => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 32000 });
      const chunks = [];
      let cancelled = false;
      const blob = await new Promise((resolve, reject) => {
        const stop = () => { if (recorder.state === "recording") recorder.stop(); };
        stopRecording = () => { cancelled = true; stop(); };
        const timer = setTimeout(stop, 10000);
        recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
        recorder.onerror = event => { clearTimeout(timer); reject(event.error); };
        recorder.onstop = () => {
          clearTimeout(timer);
          resolve(new Blob(chunks, { type: recorder.mimeType.split(";")[0] }));
        };
        recorder.start();
      });
      if (draft !== context.draft || cancelled) return;
      const details = blob.size <= 125000 ? store.validAudio({ kind: "recorded", consent: true, durationSeconds: 10, dataUrl: await encodeAudio(blob) }) : null;
      if (!details) {
        notify("录音格式或体积超出演示上限，请选演示音轨");
        return;
      }
      draft.audio = details;
      draft.consent = false;
      notify("已录 10 秒 · 可先预听再发送");
    } catch {
      notify("未能录音，请检查麦克风权限或选演示音轨");
    } finally {
      stream?.getTracks().forEach(track => track.stop());
      stopRecording = null;
      context.recording = false;
      render({ retainInput: true });
    }
  }

  function submitLetter(form) {
    const textarea = form.elements.body;
    const body = Array.from(root.EscortTraditional(textarea.value)).slice(0, data.post.maxLength).join("").trim();
    const city = view.station(store.load());
    const blocked = data.post.blocked.some(word => body.includes(root.EscortTraditional(word)));
    const error = !body ? "请写一句粮票寄语。" :
      blocked ? "寄语含演示拦截词，请修改后再放飞。" :
      !store.validAudio(context.draft.audio, city.id) ? "请附上 10 秒声音。" :
      !form.elements.consent.checked ? "请先勾选寄语和声音的投递同意。" : "";
    if (error) {
      form.querySelector("#letter-error").textContent = error;
      if (!body || blocked) textarea.focus();
      else if (context.draft.audio) form.elements.consent.focus();
      return;
    }
    const result = store.update(state => {
      if (state.profile.stationId !== city.id || !ourRoute(state).stampedAt) return false;
      const available = data.cities.filter(item => item.id !== city.id);
      const to = available.find(item => item.id === context.draft.to) || available[Math.floor(Math.random() * available.length)];
      const audio = store.validAudio(context.draft.audio, city.id);
      const letter = {
        id: store.id(), routeId: city.id, fromCityId: city.id, toCityId: to.id,
        author: state.profile.nickname, tag: data.post.tags[context.draft.preset], body, replyTo: context.draft.replyTo,
        source: audio.kind === "demo" ? "seed" : "live", audio, createdAt: now(),
        ticket: { landmark: city.site, token: city.token, notes: city.ticket.notes, lyric: city.ticket.line }
      };
      state.outgoing.push(letter);
      store.appendEvent(state, "pigeon.sent", letter, letter.createdAt);
      return to;
    });
    if (!result) return;
    context.draft = defaultDraft();
    context.mailTab = "out";
    render();
    animateFlight();
    notify(store.persisted() ? "已放飞至" + result.short + " · 模拟木匣待出粮票" : "信笺已写入当前会话，本地存档不可用");
  }

  function inboxLetter(state, id) {
    return state.incoming.find(letter => letter.id === id && letter.toCityId === state.profile.stationId);
  }

  function openLetter(id, inbox) {
    const state = store.load();
    const letter = inbox ? inboxLetter(state, id) : state.outgoing.find(item => item.id === id && item.fromCityId === state.profile.stationId);
    if (!letter) return;
    if (inbox && !letter.readAt) {
      store.update(saved => {
        const received = inboxLetter(saved, id);
        if (received) received.readAt ||= now();
      });
      render();
    }
    openSheet(view.letterSheet(store.load(), letter, inbox));
  }

  function resonate(id) {
    const item = store.update(state => {
      const letter = inboxLetter(state, id);
      if (!letter || letter.resonatedAt) return false;
      letter.resonatedAt = now();
      return letter;
    });
    if (item) openSheet(view.letterSheet(store.load(), item, true));
  }

  function reply(id) {
    const state = store.load();
    const letter = inboxLetter(state, id);
    if (!letter || !ourRoute(state).stampedAt) return;
    context.draft = { ...defaultDraft(), to: letter.fromCityId, replyTo: letter.id, replyAuthor: letter.author };
    closeSheet();
    go("post", true);
    screen.scrollTop = 0;
  }

  function collectTicket(id) {
    const origin = store.update(state => {
      const letter = inboxLetter(state, id);
      const route = ourRoute(state);
      if (!route.stampedAt || !letter || route.tickets[letter.fromCityId]) return false;
      route.tickets[letter.fromCityId] = { id: letter.id, source: letter.source, collectedAt: now() };
      return letter.fromCityId;
    });
    if (!origin) return;
    context.stamp = origin;
    closeSheet();
    go("passbook", true);
    notify(data.city(origin).short + "粮票已入牒");
  }

  function makeDemoTicket(state, city, source) {
    const toCityId = state.profile.stationId;
    const previous = state.outgoing.slice().reverse().find(letter => letter.fromCityId === toCityId && letter.toCityId === city.id);
    const letter = {
      id: store.id(), fromCityId: city.id, toCityId, body: city.seeds[state.incoming.length % city.seeds.length],
      author: source === "seed" ? "守夜老镖师" : "木匣留票", tag: "四城民谣粮票",
      source, audio: store.sampleAudio(city.id), replyTo: previous?.id || null,
      createdAt: now(), resonatedAt: null, readAt: null
    };
    state.incoming.push(letter);
    return letter;
  }

  function backup() {
    const state = store.load();
    const city = view.station(state);
    const route = ourRoute(state);
    const missing = data.cities.filter(item => item.id !== city.id && !route.tickets[item.id]);
    if (!route.stampedAt || !missing.length) {
      notify("本程无需再补异城粮票");
      return;
    }
    openSheet(`<p class="eyebrow">飞鸽匣 · 自助补票</p><h2 id="sheet-title">余温与备用粮票</h2>
      <p class="sheet-copy">票少时先看箱旁麻绳夹。纸机异常时，从木匣暗格取对应异城的备用票。</p>
      <form id="backup-form"><label for="backup-city">要补哪座城？</label><select id="backup-city" name="city">${missing.map(other => `<option value="${other.id}">${view.html(other.name)}</option>`).join("")}</select>
        <label for="backup-kind">票面标记</label><select id="backup-kind" name="kind"><option value="reserve">余温票 · 麻绳夹</option><option value="emergency">备用票 · 木匣暗格</option></select>
        <button type="submit" class="button primary full">模拟扫码读取票面</button></form>`);
  }

  function readBackup(form) {
    const city = data.city(form.elements.city.value);
    const source = form.elements.kind.value;
    if (!city || !["reserve", "emergency"].includes(source)) return;
    const letter = store.update(state => {
      const route = ourRoute(state);
      if (!route.stampedAt || city.id === state.profile.stationId || route.tickets[city.id]) return false;
      return makeDemoTicket(state, city, source);
    });
    if (letter) {
      context.mailTab = "in";
      render();
      openLetter(letter.id, true);
    }
  }

  function issueCredential(rotate = false) {
    const credential = store.update(state => {
      const route = ourRoute(state);
      if (!view.qualified(route) || route.redemption) return false;
      const existing = route.credential;
      if (existing && !rotate && Date.parse(existing.expiresAt) > Date.now()) return existing;
      const time = now();
      const random = root.crypto.getRandomValues(new Uint32Array(1))[0];
      let code = String(100000 + random % 900000);
      if (code === existing?.code) code = String(100000 + (random + 1) % 900000);
      const stationId = state.profile.stationId;
      const fresh = {
        id: store.id(), code, routeId: stationId, stationId, rewardName: data.rewardName,
        issuedAt: time, expiresAt: new Date(Date.parse(time) + credentialSeconds * 1000).toISOString(),
        ticketIds: Object.values(route.tickets).map(ticket => ticket.id)
      };
      route.credential = fresh;
      store.appendEvent(state, "verification.issued", fresh, time);
      return fresh;
    });
    if (!credential) {
      closeSheet();
      render();
      notify("请先集齐实体文牒四格");
      return;
    }
    openSheet(view.credentialSheet(data.city(credential.stationId), credential, store.load().demoStock));
    activeCredential = { cityId: credential.stationId, id: credential.id };
    const tick = () => {
      const counter = sheet.querySelector("#countdown");
      const remaining = Math.max(0, Math.ceil((Date.parse(credential.expiresAt) - Date.now()) / 1000));
      if (counter) counter.textContent = remaining ? "有效期 " + remaining + " 秒" : "凭证已过期";
      if (!remaining) clearInterval(codeTimer);
    };
    codeTimer = setInterval(tick, 350);
    tick();
  }

  function redeem(form) {
    const error = form.querySelector("#redeem-error");
    if (form.elements.pin.value.trim() !== staffPin) {
      error.textContent = "口令有误，请由店员重新输入。";
      form.elements.pin.focus();
      return;
    }
    const result = store.update(state => {
      const route = ourRoute(state);
      if (route.redemption) return false;
      const credential = route.credential;
      if (!view.qualified(route) || credential?.id !== form.dataset.credential || Date.parse(credential.expiresAt) <= Date.now()) return "expired";
      const time = now();
      const fulfillment = state.demoStock ? "collected" : "pending";
      route.redemption = { credentialId: credential.id, fulfillment, redeemedAt: time };
      route.credential = null;
      store.appendEvent(state, "verification.redeemed", {
        ...route.redemption, routeId: credential.routeId, stationId: credential.stationId, rewardName: credential.rewardName
      }, time);
      return fulfillment;
    });
    if (result === "expired") {
      error.textContent = "凭证已失效，请刷新码后重试。";
      return;
    }
    if (!result) {
      closeSheet();
      render();
      notify("此文牒已完成核销");
      return;
    }
    render();
    openSheet(`<div class="ceremony">${view.image("coat", "ceremony-coat")}<p class="eyebrow">交镖礼成 · 四城合奏</p><h2 id="sheet-title">金牌总镖头</h2>
      <p>${result === "collected" ? "四城风物礼盒已领取。" : "礼盒暂缺，可回到文牒登记顺丰补发。"}</p>${button("报名腊八红马甲施粥", "signup")}</div>`);
  }

  function signup() {
    const route = ourRoute(store.load());
    if (!route.redemption || route.signup) return;
    openSheet(`<p class="eyebrow">腊八正日 · 四城共熬一碗粥</p><h2 id="sheet-title">红马甲街头施粥</h2>${view.image("hearth", "signup-hearth")}<p class="sheet-copy">和小屋一起背吉他上街，为环卫工和异乡人送碗热粥。这是本地报名演示。</p>
      <form id="signup-form"><label for="signup-role">参与岗位</label><select id="signup-role" name="role">${data.roles.map(role => `<option value="${role}">${role}</option>`).join("")}</select>
        <label for="signup-shift">轮岗时段</label><select id="signup-shift" name="shift">${data.shifts.map(shift => `<option value="${shift}">${shift}</option>`).join("")}</select>
        <button type="submit" class="button primary full">确认报名</button></form>`);
  }

  function register(form) {
    const role = form.elements.role.value;
    const shift = form.elements.shift.value;
    if (!data.roles.includes(role) || !data.shifts.includes(shift)) return;
    if (store.update(state => {
      const route = ourRoute(state);
      if (!route.redemption || route.signup) return false;
      route.signup = { role, shift, registeredAt: now() };
      return true;
    })) {
      closeSheet();
      go("passbook");
      notify(shift === "候补轮" ? "候补已登记 · 本地演示" : "已登记" + shift + role + " · 本地演示");
    }
  }

  function requestShipment() {
    if (store.update(state => {
      const redemption = ourRoute(state).redemption;
      if (redemption?.fulfillment !== "pending") return false;
      redemption.fulfillment = "registered";
      redemption.requestedAt = now();
      return true;
    })) {
      render();
      notify("原单补发登记已保存 · 本地演示");
    }
  }

  function demoUnlock() {
    store.update(state => {
      const time = now();
      for (const route of Object.values(state.routes)) {
        route.startedAt ||= time;
        route.hunt ||= { mode: "demo", image: "", completedAt: time };
        route.heardAt ||= time;
        route.pouredAt ||= time;
        route.stampedAt ||= time;
      }
    });
    go("journey", true);
    notify("四城三关已快进 · 当前分舵可继续寄票与贴牒");
  }

  function demoLetter(all) {
    const count = store.update(state => {
      const existing = new Set(state.incoming.filter(letter => letter.toCityId === state.profile.stationId).map(letter => letter.fromCityId));
      const others = data.cities.filter(city => city.id !== state.profile.stationId && !ourRoute(state).tickets[city.id]);
      const missing = others.filter(city => !existing.has(city.id));
      const chosen = all ? missing : [missing[0] || others[0]].filter(Boolean);
      for (const city of chosen) makeDemoTicket(state, city, "seed");
      return chosen.length || false;
    });
    context.mailTab = "in";
    go("post", true);
    if (count) {
      ring();
      animateBox();
    }
    notify(count ? "模拟木匣响铃 · 收到 " + count + " 张预录粮票" : "收件箱已有所需异城粮票");
  }

  const actions = {
    home: () => go("home", true),
    back: () => go("home", true),
    journey: () => go("journey", true),
    post: () => { closeSheet(); go("post", true); },
    passbook: () => go("passbook", true),
    close: closeSheet,
    about: () => openSheet(`<p class="eyebrow">自助领牒 · 三关一匣</p><h2 id="sheet-title">押镖怎么玩？</h2><ol class="rules"><li>扫门口木架码，领取押镖令和实体文牒。</li><li>听音寻味、火塘听曲、落米成音，钤本城印。</li><li>听木匣响铃，撕下三个不同异城的粮票，扫码贴入文牒。</li><li>四格齐了到吧台核销，晋升金牌总镖头。</li></ol>${button("知道了", "close")}`),
    sound: () => {
      store.update(state => { state.sound = !state.sound; });
      render();
      if (store.load().sound) ring();
      notify(store.load().sound ? "木匣铃声已开启" : "木匣铃声已静音");
    },
    route: control => openSheet(view.routeSheet(data.city(control.dataset.value), store.load())),
    accept,
    "hunt-audio": toggleHuntAudio,
    "hunt-location": () => beginHunt("landmark"),
    weather,
    "finish-hunt": finishHunt,
    pour,
    stamp,
    tag: control => {
      context.draft.preset = Number(control.dataset.value);
      for (const chip of screen.querySelectorAll(".chip")) chip.setAttribute("aria-pressed", String(chip === control));
    },
    preset: () => setDraftBody(document.querySelector("#letter-body"), root.EscortTraditional(view.station(store.load()).seeds[context.draft.preset])),
    record: recordAudio,
    "demo-audio": () => {
      if (context.recording) return;
      context.draft.audio = store.sampleAudio(store.load().profile.stationId);
      context.draft.consent = false;
      render();
    },
    "clear-audio": () => { resetAudioConsent(); render(); },
    "cancel-reply": () => {
      Object.assign(context.draft, { replyTo: null, replyAuthor: null, to: "random" });
      render();
    },
    "mail-in": () => { context.mailTab = "in"; render(); screen.querySelector('[data-action="mail-in"]').focus({ preventScroll: true }); },
    "mail-out": () => { context.mailTab = "out"; render(); screen.querySelector('[data-action="mail-out"]').focus({ preventScroll: true }); },
    letter: control => openLetter(control.dataset.value, control.dataset.box === "in"),
    resonate: control => resonate(control.dataset.value),
    reply: control => reply(control.dataset.value),
    "collect-ticket": control => collectTicket(control.dataset.value),
    backup,
    redeem: () => issueCredential(),
    "rotate-code": () => issueCredential(true),
    signup,
    shipment: requestShipment,
    "demo-unlock": demoUnlock,
    "demo-letter": () => demoLetter(false),
    "demo-three": () => demoLetter(true),
    "demo-reset": () => openSheet(`<p class="eyebrow">路演控制台</p><h2 id="sheet-title">重置本地存档？</h2><p class="sheet-copy">当前浏览器中的三关进度、往来粮票、核销和报名记录都会清除。</p><div class="two-actions">${button("取消", "close", "light")}${button("确认重置", "confirm-reset", "red")}</div>`),
    "confirm-reset": () => {
      closeSheet();
      store.reset();
      context.draft = defaultDraft();
      context.mailTab = "in";
      context.stamp = null;
      go("home");
      notify("本地活动存档已重置");
    }
  };

  const submissions = {
    "letter-form": submitLetter, "redeem-form": redeem, "answer-form": verifyAnswer,
    "weather-form": verifyWeather, "backup-form": readBackup, "signup-form": register
  };
  document.addEventListener("click", event => {
    const control = event.target.closest("button[data-action]");
    if (control && Object.hasOwn(actions, control.dataset.action)) actions[control.dataset.action](control);
  });
  document.addEventListener("submit", event => {
    if (!Object.hasOwn(submissions, event.target.id)) return;
    event.preventDefault();
    submissions[event.target.id](event.target);
  });
  document.addEventListener("input", event => {
    if (event.target.id === "letter-body" && !event.isComposing) setDraftBody(event.target, event.target.value);
    if (event.target.id === "hunt-seek") {
      const audio = document.querySelector("#hunt-audio");
      if (audio && Number.isFinite(audio.duration)) audio.currentTime = Number(event.target.value);
    }
  });
  for (const event of ["timeupdate", "loadedmetadata", "play", "pause", "ended"]) {
    document.addEventListener(event, updateHuntAudio, true);
  }
  document.addEventListener("compositionend", event => {
    if (event.target.id === "letter-body") setDraftBody(event.target, event.target.value);
  });
  document.addEventListener("change", event => {
    const input = event.target;
    if (input.id === "destination") context.draft.to = input.value;
    if (input.id === "audio-consent") context.draft.consent = input.checked;
    if (input.id === "hunt-photo") void loadPhoto(input);
    if (input.id === "demo-stock") store.update(state => { state.demoStock = input.checked; });
    if (input.id === "demo-shop") {
      store.update(state => { state.profile.stationId = input.value; });
      context.draft = defaultDraft();
      context.mailTab = "in";
      context.stamp = null;
      go("home", true);
      notify("已切换至" + data.city(input.value).name);
    }
  });
  document.addEventListener("error", event => {
    if (event.target.matches?.("img.art")) event.target.remove();
  }, true);

  function receiveInbox() {
    const previous = store.load().incoming.length;
    if (store.syncInbox()) {
      const state = store.load();
      render({ retainInput: true });
      if (state.incoming.slice(previous).some(letter => letter.toCityId === state.profile.stationId)) {
        ring();
        animateBox();
        notify("木匣有新的异城粮票");
      }
    }
  }

  root.addEventListener(store.inboxEvent, receiveInbox);
  root.addEventListener("storage", event => {
    if (event.key === store.keys.inbox) receiveInbox();
    if (event.key === store.keys.state) {
      const state = store.load();
      if (activeCredential) {
        const credential = ourRoute(state).credential;
        if (credential?.id !== activeCredential.id || state.profile.stationId !== activeCredential.cityId) closeSheet();
      }
      render({ retainInput: true });
    }
  });
  root.addEventListener("resize", layoutSheet);
  root.addEventListener("pagehide", () => stopRecording?.());
  root.visualViewport?.addEventListener("resize", layoutSheet);

  document.querySelector("#status-icons").innerHTML = ["radio", "wifi", "battery"].map(view.icon).join("");
  document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim();
  document.querySelector("#about-icon").innerHTML = view.icon("more");
  document.querySelector("#home-icon").innerHTML = view.icon("mini");
  document.querySelector(".mini-back").innerHTML = view.icon("left");
  document.querySelector("#demo-summary").innerHTML = `<span class="demo-summary-icon">${view.icon("sliders")}</span><span>路演控制台<small>仅桌面展示</small></span>${view.icon("down")}`;
  tabs.innerHTML = view.tabs.map(tab => `<button type="button" data-action="${tab.id}"><span class="tab-art"></span><span>${tab.label}</span></button>`).join("");
  flight.innerHTML = view.asset("bird", "bird");

  const scan = new URLSearchParams(root.location.search);
  const freshNavigation = root.performance.getEntriesByType("navigation")[0]?.type !== "reload";
  const scannedStation = freshNavigation && data.scanCity(scan.get("station"));
  if (scannedStation) store.update(state => { state.profile.stationId = scannedStation.id; });
  store.repairOutbox();
  store.syncInbox();
  render();
  if (freshNavigation) {
    const touchpoint = scan.get("touchpoint");
    const ticket = scan.get("ticket");
    const route = data.scanCity(scan.get("route")) || scannedStation;
    if (ticket && inboxLetter(store.load(), ticket)) {
      go("post");
      openLetter(ticket, true);
    } else if (touchpoint === "weather" || touchpoint === "rice" || touchpoint === "plaque") {
      go("journey");
      if (touchpoint === "weather") beginHunt("weather");
      if (touchpoint === "rice") stamp();
    } else if (route) {
      openSheet(view.routeSheet(route, store.load()));
    }
  }
})(window);
