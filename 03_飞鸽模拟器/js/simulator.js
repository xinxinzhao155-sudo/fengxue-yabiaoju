(() => {
  "use strict";

  const { cities, assets, icon, asset, token, landmark, machine, installTheme } = window.PigeonData;
  const audio = window.PigeonAudio;
  const ids = Object.keys(cities);
  const byId = (id) => document.getElementById(id);
  const element = Object.fromEntries(Array.from(document.querySelectorAll("[id]"), (node) => [node.id, node]));
  const steps = Array.from(element.steps.children);
  const emptyShop = () => ({ tickets: [], selected: null, stamp: false, pasted: new Map(), paper: 100, reward: null });
  const shops = Object.fromEntries(ids.map((id) => [id, emptyShop()]));
  const issuedCodes = new Set();
  const receipts = [];
  const drafts = Object.fromEntries(ids.map((id) => [id, { message: cities[id].messages[0], attached: false }]));
  const times = { pack: 180, ring: 1530, print: 1870, finish: 2890 };
  let source = "xian";
  let target = "suzhou";
  let blind = false;
  let sound = true;
  let busy = false;
  let watchTimer = null;
  let toastTimer;
  let rewardInterval;
  let modalMode = "";
  let playing = null;
  let ticketCount = 0;
  let newestReceipt = null;
  let scanTimer;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const shop = () => shops[target];
  const visibleTicket = () => shop().selected;
  const currentDraft = () => drafts[source];
  const stateDot = (label) => "<i aria-hidden=\"true\"></i> " + label;
  const timeLabel = (ms) => "+" + Math.round(ms).toLocaleString("zh-CN") + " ms";
  const timestamp = (date) => date.toLocaleString("zh-CN", { hour12: false });
  const safe = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function toast(message) {
    element.toast.hidden = false;
    element.toast.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.toast.hidden = true; }, 3800);
  }

  function view(name, scroll = false) {
    element.workspace.dataset.view = name;
    document.querySelectorAll("[data-view][aria-pressed]").forEach((tab) => {
      tab.setAttribute("aria-pressed", String(tab.dataset.view === name));
    });
    if (scroll && matchMedia("(max-width: 930px)").matches) {
      document.querySelector(".mobile-tabs").scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }

  function wave(animate = false, ticket = false) {
    const bars = [4, 8, 12, 5, 15, 9, 5, 13, 10, 6, 12, 7];
    return '<span class="wave' + (animate ? ' playing' : '') + (ticket ? ' ticket-wave' : '') + '" aria-hidden="true">' +
      bars.map((height, i) => '<i style="--amplitude:' + height + 'px;--beat:-' + (i * 83) + 'ms"></i>').join("") + "</span>";
  }

  function distance(a, b) {
    const rad = Math.PI / 180;
    const [latA, lngA] = cities[a].coordinate;
    const [latB, lngB] = cities[b].coordinate;
    const arc = Math.sin((latB - latA) * rad / 2) ** 2 +
      Math.cos(latA * rad) * Math.cos(latB * rad) * Math.sin((lngB - lngA) * rad / 2) ** 2;
    return Math.round(6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc)));
  }

  function cityOptions(selected, omit = "") {
    return ids.filter((id) => id !== omit).map((id) =>
      '<option value="' + id + '"' + (id === selected ? " selected" : "") + ">" + cities[id].name + "</option>"
    ).join("");
  }

  function updatePhoneTime() {
    element["phone-time"].textContent = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  function renderVoice() {
    const draft = currentDraft();
    const active = playing === "preview";
    const label = active ? "停止试听" : draft.attached ? "已附上 · 试听" : "附上原声";
    element.attach.setAttribute("aria-pressed", String(draft.attached));
    element.attach.innerHTML = '<span class="voice-action">' + icon(active ? "stop" : draft.attached ? "check" : "play") + "</span>" +
      '<span class="voice-text">' + label + "</span>" + asset(assets.voice, wave(active)) + '<span class="voice-time">0:10</span>';
  }

  function stopMusic() {
    clearInterval(scanTimer);
    audio.stop();
    playing = null;
    renderVoice();
  }

  function renderRoute() {
    element.source.innerHTML = cityOptions(source, target);
    element.target.innerHTML = cityOptions(target, source);
    element.destination.innerHTML = cityOptions(blind ? "" : target, source) +
      '<option value="blind"' + (blind ? " selected" : "") + ">江湖随机盲盒分舵</option>";
    element["route-source-icon"].innerHTML = token(source);
    element["route-target-icon"].innerHTML = token(target);
    element.distance.innerHTML = distance(source, target).toLocaleString("zh-CN") + " <small>公里</small>";
    element.distance.setAttribute("aria-label", cities[source].name + "至" + cities[target].name + "直线距离");
    element["receiving-city"].textContent = cities[target].name + "分舵 · 吧台实景模拟";
    element["passport-city"].textContent = cities[target].name + "分舵 · 本城印章与三座异城粮票";
    const sender = cities[source];
    element["sender-city"].innerHTML = '<span class="token">' + token(source) + "</span><div><strong>" + sender.name +
      "分舵</strong><small>已解锁 " + sender.ingredient + "音符 · " + sender.scene + "</small></div>";
    element.message.value = currentDraft().message;
    updateCounter();
    renderVoice();
    renderInbox();
    renderPaper();
    renderBook();
    renderTicket();
    renderLocks();
  }

  function changeRoute(from, to, preserveBlind = false) {
    if (from !== source && playing === "preview") stopMusic();
    source = from;
    target = to;
    if (!preserveBlind) blind = false;
    renderRoute();
    if (!busy) setTrack(-1);
  }

  function updateCounter() {
    element.counter.textContent = currentDraft().message.length + " / 80";
  }

  function renderPaper() {
    const percent = shop().paper;
    element.paper.value = percent;
    element["paper-value"].textContent = percent + "%";
    const modalPaper = byId("modal-paper");
    if (modalPaper) modalPaper.value = percent;
    const modalPaperValue = byId("modal-paper-value");
    if (modalPaperValue) modalPaperValue.textContent = percent + "%";
  }

  function updateSound() {
    element.mute.innerHTML = icon(sound ? "sound" : "mute") + (sound ? " 音效开启" : " 音效静音");
    element.mute.setAttribute("aria-pressed", String(sound));
  }

  function renderLocks() {
    ["source", "target", "swap", "destination", "send", "relay", "prefill"].forEach((key) => {
      element[key].disabled = busy;
    });
    element.send.innerHTML = icon("bird") + (busy ? " 飞鸽传书中…" : " 飞鸽传书 · 寄往异城分舵");
  }

  function setTrack(step, completed = false, started = 0) {
    steps.forEach((node, i) => {
      node.classList.toggle("active", i === step && !completed);
      node.classList.toggle("done", i < step || completed);
      if (i === step && !completed) node.setAttribute("aria-current", "step");
      else node.removeAttribute("aria-current");
      if (step < 0 || i > step) node.querySelector(".step-time").textContent = "";
      else if (i === step && !completed) node.querySelector(".step-time").textContent = timeLabel(performance.now() - started);
    });
    const tracking = element["flight-status"];
    tracking.className = "state" + (completed ? " complete" : step >= 0 ? " running" : "");
    tracking.innerHTML = stateDot(completed ? "粮票已抵达" : step >= 0 ? "传书进行中" : "待发镖");
    element.elapsed.textContent = step < 0 ? "—" : ((performance.now() - started) / 1000).toFixed(2) + " s";
    element.flight.classList.toggle("flying", step === 1 && !completed);
  }

  function qrGraphic(number) {
    const dimensions = 25;
    let state = number * 9643 + 1;
    let pixels = "";
    const finders = [[0, 0], [dimensions - 7, 0], [0, dimensions - 7]];
    for (let y = 0; y < dimensions; y++) {
      for (let x = 0; x < dimensions; x++) {
        const box = finders.find(([h, v]) => x >= h - 1 && x <= h + 7 && y >= v - 1 && y <= v + 7);
        state = (state * 48271) % 2147483647;
        let marked = state % 11 > 5;
        if (box) {
          const a = x - box[0];
          const b = y - box[1];
          marked = a >= 0 && a < 7 && b >= 0 && b < 7 &&
            (a === 0 || a === 6 || b === 0 || b === 6 || (a >= 2 && a <= 4 && b >= 2 && b <= 4));
        } else if (x === 6 || y === 6) marked = (x + y) % 2 === 0;
        if (marked) pixels += "M" + x + " " + y + "h1v1h-1z";
      }
    }
    return '<svg viewBox="-2 -2 29 29" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true"><path d="' + pixels + '"/></svg>';
  }

  function ticketHtml(ticket, print = false) {
    const city = cities[ticket.from];
    const isReady = ticket.status === "loose";
    const code = qrGraphic(ticket.number);
    const scanContent = code + '<span class="ticket-scan-label">' + wave(false, !print) + (print ? "模拟声波码" : "扫码听音 · 10s") + '</span>';
    const tearContent = asset(assets.tear, "⌁ 锯齿撕票线 ⌁");
    return '<article class="ticket' + (!print && ticket.status === "printing" ? " printing" : "") +
      (!print && isReady ? " detached" : "") + '"><div class="ticket-landmark">' + landmark(ticket.from) + '<span>' + token(ticket.from) +
      '</span></div><span class="ticket-brand">风雪押镖局</span><h3>' + city.short + city.ingredient +
      '民谣粮票</h3><span class="ticket-meta">' + ticket.id + " · " + timestamp(ticket.date) +
      '</span><div class="notation">' + city.notation + "<small>" + city.lyric + '</small></div><p class="ticket-message">' + safe(ticket.message) +
      "</p>" + (print ? '<div class="ticket-scan">' + scanContent + '</div><div class="tear-line">' + tearContent + "</div>" :
        '<button class="ticket-scan" id="ticket-code" type="button" aria-label="模拟微信扫码听音"' + (isReady ? "" : " disabled") + ">" +
        scanContent + '</button><button class="tear-line" id="tear-line" type="button" aria-label="点击或拖拽锯齿撕纸线"' +
        (ticket.status === "attached" ? "" : " disabled") + ">" + (isReady ? "已撕下" : tearContent) + "</button>") + "</article>";
  }

  function renderTicket() {
    const ticket = visibleTicket();
    const status = ticket?.status;
    const printing = status === "printing";
    const loose = status === "loose";
    const attached = status === "attached";
    const caption = loose ? "粮票已撕下" : attached ? "粮票已到 · 等待自助撕取" : printing ? "热敏头走纸中" : "黄铜铃静候来信";
    element.stage.classList.toggle("has-ticket", Boolean(ticket));
    element["stage-caption"].textContent = caption;
    element["box-status"].innerHTML = stateDot(attached ? "待撕票" : printing ? "出票中" : "设备就绪");
    element["box-status"].className = "state receiver-state" + (attached || printing ? " running" : "");
    element["ticket-slot"].innerHTML = ticket ? ticketHtml(ticket) : "";
    element["clip-count"].textContent = String(shop().tickets.length);
    element.tear.disabled = !attached;
    element.scan.disabled = !loose;
    element.paste.disabled = !loose;
    element["glue-prop"].disabled = !loose;
    element.print.disabled = !ticket || printing;
    element["ticket-tip"].textContent = loose ? (shop().pasted.has(ticket.from) ? "文牒已有这座城的粮票。仍可听音或打印。" : "微信扫票尾听十秒原声，也可用点点胶贴入文牒。") :
      attached ? "沿锯齿线点击或下拉，撕下这张温热的粮票。" : printing ? "黄底热敏纸正在从匣口送出。" : "飞鸽抵达时，铜铃会响，粮票会从匣口慢慢吐出。";
    if (attached) {
      const line = byId("tear-line");
      let start = null;
      line.addEventListener("pointerdown", (event) => {
        start = [event.clientX, event.clientY];
        line.setPointerCapture(event.pointerId);
      });
      line.addEventListener("pointerup", (event) => {
        if (start && Math.hypot(event.clientX - start[0], event.clientY - start[1]) > 10) tearTicket();
        start = null;
      });
      line.addEventListener("pointercancel", () => { start = null; });
      line.addEventListener("click", tearTicket);
    }
    byId("ticket-code")?.addEventListener("click", scanTicket);
  }

  function measureTicket() {
    const slot = element["ticket-slot"];
    const top = slot.getBoundingClientRect().top - element.stage.getBoundingClientRect().top;
    element.stage.style.setProperty("--ticket-depth", Math.ceil(top + slot.offsetHeight + 39) + "px");
  }

  function newTicket(from, to, message) {
    ticketCount++;
    return {
      id: "FX-" + String(ticketCount).padStart(4, "0"), number: ticketCount,
      from, to, message, date: new Date(), status: "printing", heard: false
    };
  }

  async function deliver({ from, to, message }) {
    changeRoute(from, to, true);
    view("receive", true);
    const destination = shops[to];
    if (destination.paper < 2) {
      destination.paper = 100;
      toast(cities[to].name + "模拟更换了一卷黄底热敏纸。");
    }
    const ticket = newTicket(from, to, message);
    const start = performance.now();
    setTrack(0, false, start);
    await delay(times.pack);
    setTrack(1, false, start);
    await delay(times.ring - times.pack);
    setTrack(2, false, start);
    element.machine.innerHTML = machine(true);
    element.stage.classList.add("ringing");
    element["stage-caption"].textContent = "钱箱脉冲 · 铜铃已响";
    element["box-status"].innerHTML = stateDot("电磁铁动作");
    element["box-status"].className = "state receiver-state running";
    audio.effect("bell");
    await delay(times.print - times.ring);
    setTrack(3, false, start);
    destination.selected = ticket;
    destination.paper -= 2;
    renderPaper();
    renderTicket();
    audio.effect("printer");
    await delay(times.finish - times.print);
    ticket.status = "attached";
    destination.tickets.unshift(ticket);
    element.stage.classList.remove("ringing");
    element.machine.innerHTML = machine(false);
    renderTicket();
    setTrack(3, true, start);
    element.announce.textContent = cities[to].name + "铜铃已响，" + cities[from].ingredient + "粮票已吐出。";
  }

  async function run(jobs, restoreRoute = false) {
    if (busy) return;
    audio.unlock();
    const original = [source, target];
    busy = true;
    renderLocks();
    try {
      for (const [index, job] of jobs.entries()) {
        await deliver(job);
        if (index < jobs.length - 1) await delay(720);
      }
      if (restoreRoute) {
        changeRoute(...original, true);
        playEnsemble();
        toast("四城连发已完成，各分舵的粮票可在余温粮票夹翻阅。");
      }
    } finally {
      busy = false;
      renderLocks();
    }
  }

  function tearTicket() {
    const ticket = visibleTicket();
    if (ticket?.status !== "attached") return;
    ticket.status = "loose";
    audio.effect("tear");
    renderTicket();
    element["ticket-slot"].firstElementChild.classList.add("detaching");
    element.announce.textContent = "粮票已撕下，可以扫码或贴文牒。";
  }

  function showDialog(mode, html) {
    if (modalMode === "scan" && playing === "scan") stopMusic();
    clearInterval(rewardInterval);
    modalMode = mode;
    element["dialog-content"].innerHTML = html;
    if (!element.dialog.open) element.dialog.showModal();
    element["dialog-close"].focus();
  }

  function closeDialog() {
    if (element.dialog.open) element.dialog.close();
  }

  function receiptPicture(ticket) {
    const city = cities[ticket.to];
    return '<figure class="receipt-picture"><img src="' + city.receiptFile +
      '" alt="' + city.scene + ' · 模拟回执场景"><figcaption>' + city.name + " · " + city.scene + "</figcaption></figure>";
  }

  function scanTicket() {
    const ticket = visibleTicket();
    if (ticket?.status !== "loose") return;
    const city = cities[ticket.from];
    showDialog("scan", '<h2 id="dialog-title">微信扫码听音</h2><p>' + city.name +
      '寄来的十秒原声 · ' + city.style + '</p><div class="modal-voice"><button class="icon-button" id="listen" type="button" aria-label="重听十秒原声">' +
      icon("play") + '</button><div id="scan-wave"></div><b id="scan-time">0:10</b></div><p id="scan-status" class="muted"></p>' +
      receiptPicture(ticket) + '<button class="primary dialog-cta" id="capture" type="button">' + icon("camera") + ' 拍一张本城小屋现场照回传给 TA</button>');
    const play = () => {
      stopMusic();
      playing = "scan";
      byId("scan-wave").innerHTML = wave(true);
      byId("scan-status").textContent = sound ? "正播放发镖分舵的十秒民谣。" : "音效当前静音。可打开音效后重听。";
      byId("capture").disabled = !ticket.heard || Boolean(ticket.receipt);
      byId("listen").innerHTML = icon("stop");
      byId("listen").setAttribute("aria-label", "停止试听");
      byId("scan-time").textContent = "0:10";
      const end = performance.now() + audio.duration * 1000;
      scanTimer = setInterval(() => {
        const left = Math.max(0, Math.ceil((end - performance.now()) / 1000));
        byId("scan-time").textContent = "0:" + String(left).padStart(2, "0");
      }, 150);
      audio.play([ticket.from], () => {
        clearInterval(scanTimer);
        playing = null;
        if (!element.dialog.open || modalMode !== "scan") return;
        ticket.heard = true;
        byId("scan-wave").innerHTML = wave();
        byId("scan-time").textContent = "0:00";
        byId("listen").innerHTML = icon("play");
        byId("listen").setAttribute("aria-label", "重听十秒原声");
        byId("scan-status").textContent = ticket.receipt ? "这张粮票的照片已回传。" : "十秒民谣听完了，可以拍照回传。";
        byId("capture").disabled = Boolean(ticket.receipt);
      });
    };
    byId("listen").addEventListener("click", () => {
      if (playing !== "scan") {
        play();
        return;
      }
      stopMusic();
      byId("scan-wave").innerHTML = wave();
      byId("scan-status").textContent = "已停止播放。";
      byId("listen").innerHTML = icon("play");
      byId("listen").setAttribute("aria-label", "重听十秒原声");
    });
    byId("capture").addEventListener("click", () => sendReceipt(ticket));
    play();
  }

  function sendReceipt(ticket) {
    if (ticket.receipt || !ticket.heard) return;
    ticket.receipt = true;
    receipts.unshift(ticket);
    newestReceipt = ticket;
    byId("capture").disabled = true;
    element.dialog.querySelector(".receipt-picture").classList.add("in-flight");
    audio.effect("receipt");
    if (navigator.vibrate) navigator.vibrate(100);
    renderInbox();
    toast(cities[ticket.to].name + "的现场照已回传给" + cities[ticket.from].name + "。");
    setTimeout(() => {
      if (modalMode === "scan") closeDialog();
      if (source !== ticket.from && !busy) changeRoute(ticket.from, ticket.to);
      if (source === ticket.from) view("send", true);
    }, 480);
  }

  function renderInbox() {
    const mine = receipts.filter((ticket) => ticket.from === source);
    element["receipt-count"].textContent = mine.length + " 张";
    if (!mine.length) {
      element.receipts.innerHTML = '<p class="muted">等异城酒客捎回一张火塘照片。</p>';
      return;
    }
    element.receipts.innerHTML = '<div class="receipt-list">' + mine.map((ticket) =>
      '<button type="button" class="receipt-card' + (ticket === newestReceipt ? " receipt-new" : "") + '" data-receipt="' + ticket.id +
      '"><img src="' + cities[ticket.to].receiptFile + '" alt=""><span><b>' + cities[ticket.to].name +
      " · 现场照已回传</b><small>撕下了你的" + cities[ticket.from].ingredient + "粮票，听完了十秒民谣。</small></span></button>"
    ).join("") + "</div>";
  }

  function showClip() {
    const tickets = shop().tickets;
    const list = tickets.length
      ? '<ul class="dialog-list">' + tickets.map((ticket) => '<li><button class="quiet" type="button" data-ticket="' + ticket.id +
        '">' + cities[ticket.from].name + ' · ' + cities[ticket.from].ingredient + '粮票 <span>' + ticket.id +
        (ticket.status === "attached" ? " · 待撕" : " · 已撕") + "</span></button></li>").join("") + "</ul>"
      : '<p class="muted">麻绳挂夹还是空的。收到的粮票会按抵达顺序收在这里。</p>';
    showDialog("clip", '<h2 id="dialog-title">麻绳余温粮票夹</h2><p>' + cities[target].name + "分舵 · " + tickets.length + " 张粮票</p>" + list);
  }

  const sealSvg = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="7" y="7" width="34" height="34" rx="4"/><rect x="10" y="10" width="28" height="28" rx="2"/><path d="M15 15h18M16 20h16m-14 0v11m5-11v12m6-12v11M14 34h20M24 12v6"/></svg>';
  const steamSvg = '<svg viewBox="0 0 128 103" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><ellipse cx="64" cy="60" rx="44" ry="12" fill="var(--paper-dark)"/><path d="M20 61q4 28 27 32h34q22-4 27-32Q64 81 20 61Z" fill="var(--vermilion)"/><path d="M45 91h39M45 58q9-7 20-1m4 3q9-6 12 0m-43 0h3m47-3h4"/><g class="steam-note"><path d="M37 50q-10-9 2-18 9-7 0-14m25 28q-9-10 3-20 10-10 2-17m21 40q-9-8 1-18 6-7 2-13"/><path d="M52 21v-9l6-2m23 13v-9l6-2"/><circle cx="50" cy="22" r="2"/><circle cx="79" cy="24" r="2"/></g></svg>';
  const vestSvg = '<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="28" cy="28" r="25"/><circle cx="28" cy="28" r="22" stroke-dasharray="2 2"/><path d="m16 16 7-4 5 12 5-12 7 4-3 7 4 18H15l4-18Z" fill="var(--vermilion)"/><path d="M28 24v17m-7-10h4m6 0h4"/></svg>';

  function renderBook(fresh = false) {
    const book = shop();
    const home = cities[target];
    const cells = [
      '<div class="book-page"><h3>' + home.name + '</h3><span class="book-symbol book-seal' +
      (fresh ? " fresh" : "") + '">' + asset(assets.seal, sealSvg) + '</span>' +
      (book.stamp ? "<small>本城大印 · 已盖</small>" : '<button id="stamp" type="button">盖本城铜链大印</button>') + '</div>'
    ];
    for (const id of ids.filter((city) => city !== target)) {
      const ticket = book.pasted.get(id);
      cells.push('<div class="book-page"><h3>' + cities[id].name + "</h3>" +
        (ticket ? '<button class="book-stub" type="button" data-book-ticket="' + id + '">' +
          landmark(id) + '<b>' + cities[id].ingredient + '粮票</b><small>' +
          (ticket.demo ? "演示样票" : ticket.id) + "</small></button>" : '<span class="book-symbol">' + token(id) +
          '</span><small>待贴 ' + cities[id].ingredient + '粮票</small>') + "</div>");
    }
    element.songbook.innerHTML = cells.join("");
    element["passport-count"].textContent = (Number(book.stamp) + book.pasted.size) + " / 4";
    element.prefill.textContent = book.reward ? "查看总镖头勋章" : "快捷演示 · 仅差一票";
    byId("stamp")?.addEventListener("click", () => {
      book.stamp = true;
      audio.effect("stamp");
      renderBook(true);
      celebrate();
    });
  }

  function pasteTicket() {
    const ticket = visibleTicket();
    if (ticket?.status !== "loose") return;
    if (shop().pasted.has(ticket.from)) {
      toast("文牒中已经贴有" + cities[ticket.from].short + "粮票，每城一格。");
      return;
    }
    shop().pasted.set(ticket.from, ticket);
    audio.effect("stamp");
    renderBook();
    renderTicket();
    view("passport", true);
    if (!celebrate()) toast("已贴入" + cities[ticket.to].name + "文牒。");
  }

  function randomCode() {
    let code;
    do {
      const number = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
      code = String(number).padStart(6, "0");
    } while (issuedCodes.has(code));
    issuedCodes.add(code);
    return code;
  }

  function playEnsemble() {
    stopMusic();
    playing = "ensemble";
    audio.play(ids, () => { playing = null; });
  }

  function celebrate() {
    const book = shop();
    if (!book.stamp || book.pasted.size !== 3 || book.reward) return false;
    book.reward = { code: randomCode(), deadline: 0 };
    renderBook();
    playEnsemble();
    showReward();
    return true;
  }

  function showReward() {
    const reward = shop().reward;
    if (!reward.deadline) reward.deadline = Date.now() + 10000;
    showDialog("reward", '<div class="badge-art">' + asset(assets.steam, steamSvg) +
      '</div><h2 id="dialog-title">四海百家福粥</h2><div class="reward-title">' + asset(assets.badge, vestSvg) +
      '<h3>晋升金牌总镖头</h3></div><p>带上文牒，领取四城限定风物伴手礼盒。腊八节还可报名穿小屋公益红马甲、背木吉他，为环卫工与异乡人弹唱、派热粥。</p>' +
      '<div class="reward-code"><small>唯一 10 秒吧台核销码 · 模拟</small><strong id="reward-number"></strong><small id="reward-timer"></small></div>');
    clearInterval(rewardInterval);
    const update = () => {
      const left = Math.max(0, Math.ceil((reward.deadline - Date.now()) / 1000));
      byId("reward-number").textContent = left ? reward.code : "已过期";
      byId("reward-timer").textContent = left ? left + " 秒后失效" : "四城勋章已收录在文牒";
      if (!left) clearInterval(rewardInterval);
    };
    update();
    rewardInterval = setInterval(update, 200);
  }

  function prefillBook() {
    const book = shop();
    if (book.reward) {
      showReward();
      return;
    }
    const missing = ids.filter((id) => id !== target && !book.pasted.has(id));
    const last = missing.includes(source) ? source : missing[0];
    book.stamp = true;
    for (const id of missing.filter((id) => id !== last)) {
      const ticket = newTicket(id, target, cities[id].messages[0]);
      ticket.status = "loose";
      ticket.demo = true;
      book.pasted.set(id, ticket);
    }
    if (last) {
      changeRoute(last, target);
      view("send", true);
      toast("文牒已备好三格，最后请发来" + cities[last].ingredient + "粮票。");
    } else {
      renderBook();
      celebrate();
    }
  }

  function showHardware() {
    showDialog("hardware", '<h2 id="dialog-title">硬件免值守原理解剖镜</h2><p>吧台旁的传书匣自动接收、响铃、吐票。撕、扫、贴全部由客人自助。</p>' +
      '<ol class="dialog-list">' + [
        ["signal", "4G / Wi-Fi 云端热敏机 · 约 ¥120", "小程序打包寄语与十秒原声，云路由在 1.5 秒内把指令发至接镖分舵。"],
        ["bell", "钱箱脉冲口 → 微型电磁铁 · 约 ¥15", "脉冲驱动电磁铁推杆，推杆敲击木匣顶部的真黄铜铃铛。"],
        ["printer", "复古黄底热敏纸 · 约 ¥3 / 卷", "热敏头走纸打印建筑、简谱、寄语和声波码，无需墨盒。"],
        ["glue", "麻绳挂夹、点点胶与折叠文牒", "客人自助撕票、微信听音、贴入五线谱，演示环节店员 0 介入。"]
      ].map(([symbol, label, copy]) => '<li><span class="heading-icon">' + icon(symbol) + '</span><div><h3>' + label +
        '</h3><p>' + copy + '</p></div></li>').join("") + '</ol><div class="paper-meter"><span class="label">' + cities[target].name +
      ' · 黄底热敏纸余量</span><strong id="modal-paper-value"></strong><progress id="modal-paper" max="100"></progress></div>');
    renderPaper();
  }

  function randomOf(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function dispatchDraft() {
    const message = currentDraft().message.trim();
    if (!message) {
      toast("给异城朋友留一句寄语，再放飞飞鸽。");
      element.message.focus();
      return;
    }
    if (!currentDraft().attached) {
      currentDraft().attached = true;
      renderVoice();
    }
    if (playing === "preview") stopMusic();
    const to = blind ? randomOf(ids.filter((id) => id !== source)) : target;
    run([{ from: source, to, message }]);
  }

  function bind() {
    element.source.addEventListener("change", () => changeRoute(element.source.value, target));
    element.target.addEventListener("change", () => changeRoute(source, element.target.value));
    element.swap.addEventListener("click", () => changeRoute(target, source));
    element.destination.addEventListener("change", () => {
      const value = element.destination.value;
      if (value === "blind") {
        blind = true;
        return;
      }
      changeRoute(source, value);
    });
    element.message.addEventListener("input", () => {
      currentDraft().message = element.message.value;
      updateCounter();
    });
    element.seed.addEventListener("click", () => {
      const draft = currentDraft();
      draft.message = randomOf(cities[source].messages.filter((message) => message !== draft.message));
      element.message.value = draft.message;
      updateCounter();
    });
    element.attach.addEventListener("click", () => {
      if (playing === "preview") {
        stopMusic();
        return;
      }
      currentDraft().attached = true;
      stopMusic();
      playing = "preview";
      renderVoice();
      audio.play([source], () => { playing = null; renderVoice(); });
    });
    element.mute.addEventListener("click", () => {
      sound = !sound;
      audio.setEnabled(sound);
      if (!sound) stopMusic();
      updateSound();
    });
    element.send.addEventListener("click", dispatchDraft);
    element.watch.addEventListener("click", () => {
      if (watchTimer) {
        clearInterval(watchTimer);
        watchTimer = null;
        element.watch.setAttribute("aria-pressed", "false");
        element.watch.lastElementChild.textContent = "守夜自动吐票";
        toast("守夜自动吐票已关闭。");
        return;
      }
      audio.unlock();
      const tick = () => {
        if (busy || element.dialog.open || document.hidden) return;
        const from = randomOf(ids.filter((id) => id !== target));
        run([{ from, to: target, message: randomOf(cities[from].messages) }]);
      };
      watchTimer = setInterval(tick, 15000);
      element.watch.setAttribute("aria-pressed", "true");
      element.watch.lastElementChild.textContent = "守夜中 · 每 15 秒";
      toast("十五秒后，守夜老镖师会向当前接镖城寄出一张粮票。");
    });
    element.relay.addEventListener("click", () => {
      const rotation = [source, ...ids.filter((id) => id !== source && id !== target), target];
      const jobs = rotation.map((from, i) => ({
        from, to: rotation[(i + 1) % rotation.length], message: cities[from].messages[0]
      }));
      run(jobs, true);
    });
    element.tear.addEventListener("click", tearTicket);
    element.scan.addEventListener("click", scanTicket);
    element.paste.addEventListener("click", pasteTicket);
    element["glue-prop"].addEventListener("click", pasteTicket);
    element.clip.addEventListener("click", showClip);
    element.hardware.addEventListener("click", showHardware);
    element.prefill.addEventListener("click", prefillBook);
    element["dialog-close"].addEventListener("click", closeDialog);
    element.dialog.addEventListener("close", () => {
      if (modalMode === "scan" && playing === "scan") stopMusic();
      clearInterval(rewardInterval);
      modalMode = "";
    });
    element["dialog-content"].addEventListener("click", (event) => {
      const clicked = event.target.closest("[data-ticket]");
      if (!clicked || visibleTicket()?.status === "printing") return;
      shop().selected = shop().tickets.find((ticket) => ticket.id === clicked.dataset.ticket);
      closeDialog();
      renderTicket();
    });
    element.receipts.addEventListener("click", (event) => {
      const card = event.target.closest("[data-receipt]");
      if (!card) return;
      const ticket = receipts.find((item) => item.id === card.dataset.receipt);
      showDialog("receipt", '<h2 id="dialog-title">' + cities[ticket.to].name + '的回执</h2><p>千里之外的酒客撕下了你的' +
        cities[ticket.from].ingredient + '粮票，听完了那十秒民谣，并寄回了这张小屋现场照。</p>' + receiptPicture(ticket));
    });
    element.songbook.addEventListener("click", (event) => {
      const button = event.target.closest("[data-book-ticket]");
      if (!button) return;
      const ticket = shop().pasted.get(button.dataset.bookTicket);
      showDialog("book-ticket", '<h2 id="dialog-title">' + (ticket.demo ? "文牒演示样票" : "贴入文牒的粮票") +
        '</h2><div class="modal-ticket">' + ticketHtml(ticket, true) + "</div>");
    });
    element.print.addEventListener("click", printTicket);
    document.querySelectorAll(".mobile-tabs button").forEach((button) => {
      button.addEventListener("click", () => view(button.dataset.view));
    });
    window.addEventListener("afterprint", () => {
      element["print-sheet"].replaceChildren();
      element["print-page"].textContent = "";
    });
    document.addEventListener("error", (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;
      if (image.parentElement?.classList.contains("public-asset")) {
        image.hidden = true;
        image.nextElementSibling.hidden = false;
      }
    }, true);
  }

  function printTicket() {
    const ticket = visibleTicket();
    if (!ticket || ticket.status === "printing") return;
    const width = element["print-width"].value === "80" ? 80 : 58;
    const sheet = element["print-sheet"];
    sheet.style.setProperty("--print-width", width + "mm");
    sheet.innerHTML = ticketHtml(ticket, true);
    element["print-page"].textContent = "@page { size: " + width + "mm 115mm; margin: 0; }";
    window.print();
  }

  bind();
  const ticketObserver = new ResizeObserver(measureTicket);
  ticketObserver.observe(element["ticket-slot"]);
  installTheme();
  document.querySelectorAll("[data-icon]").forEach((node) => {
    const name = node.dataset.icon;
    const glyph = icon(name);
    node.innerHTML = node.closest(".passport-heading") ? asset(assets.passport, glyph) : glyph;
  });
  element.flight.insertAdjacentHTML("afterbegin", asset(assets.divider, ""));
  element.machine.innerHTML = machine(false);
  updatePhoneTime();
  setInterval(updatePhoneTime, 30000);
  updateSound();
  renderRoute();
  setTrack(-1);
})();
