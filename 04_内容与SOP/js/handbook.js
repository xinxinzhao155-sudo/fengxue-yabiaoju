(function () {
  "use strict";

  const dataSource = window.HandbookData;
  const cityTabs = document.getElementById("city-tabs");
  const cityPanels = document.getElementById("city-panels");
  const roleOptions = document.getElementById("role-options");
  const sopContent = document.getElementById("sop-content");
  const materialGrid = document.getElementById("material-grid");
  const scenarios = document.getElementById("scenarios");
  const feedback = document.getElementById("feedback");
  const copyDialog = document.getElementById("copy-dialog");
  const copyText = document.getElementById("copy-text");
  const storageKey = "wind-snow-escort.laba-prep.v1";
  let activeRole = "all";
  let feedbackTimer;
  let printClosed = null;

  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  }

  function button(label, handler) {
    const node = element("button", "button", label);
    node.type = "button";
    node.addEventListener("click", handler);
    return node;
  }

  function notify(message) {
    clearTimeout(feedbackTimer);
    feedback.textContent = message;
    feedbackTimer = setTimeout(() => { feedback.textContent = ""; }, 2300);
  }

  function legacyCopy(value) {
    const previousFocus = document.activeElement;
    const input = element("textarea");
    input.value = value;
    input.readOnly = true;
    input.style.position = "fixed";
    input.style.inset = "0 auto auto 0";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      input.remove();
      previousFocus?.focus({ preventScroll: true });
    }
  }

  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      if (!legacyCopy(value)) {
        copyText.value = value;
        copyDialog.showModal();
        copyText.select();
        return;
      }
    }
    notify("已复制到剪贴板");
  }

  function quote(label, value) {
    const box = element("aside", "quote");
    const action = button("复制话术", () => copy(value));
    action.setAttribute("aria-label", "复制" + label);
    box.append(element("strong", "", label), element("p", "quote-text", value), action);
    return box;
  }

  function icon(key) {
    const asset = dataSource.iconAsset(key);
    const holder = element("span", "icon");
    holder.setAttribute("aria-hidden", "true");
    const local = element("img");
    local.alt = "";
    local.src = asset.local;
    holder.append(local);
    if (!asset.public) return holder;
    const shared = element("img");
    shared.alt = "";
    shared.addEventListener("load", () => holder.replaceChildren(shared), { once: true });
    shared.src = asset.public;
    return holder;
  }

  function sourceLink([label, url]) {
    const line = element("p", "source");
    const link = element("a", "", label);
    link.href = url;
    line.append(link);
    return line;
  }

  function copyButton(label, value) {
    return button(label, () => copy(value));
  }

  function facts(className, rows) {
    const details = element("dl", className);
    for (const [label, value] of rows) {
      details.append(element("dt", "", label), element("dd", "", value));
    }
    return details;
  }

  function steps(items) {
    const list = element("ol", "steps");
    for (const item of items) list.append(element("li", "", item));
    return list;
  }

  function selectCity(id, focus = false) {
    for (const tab of cityTabs.children) {
      const selected = tab.dataset.city === id;
      tab.setAttribute("aria-selected", selected);
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
      if (selected && focus) tab.focus();
    }
  }

  cityTabs.addEventListener("keydown", (event) => {
    const offsets = { ArrowRight: 1, ArrowLeft: -1 };
    const tabs = Array.from(cityTabs.children);
    if (!tabs.includes(event.target)) return;
    let target;
    if (event.key === "Home") target = tabs[0];
    else if (event.key === "End") target = tabs.at(-1);
    else if (Object.hasOwn(offsets, event.key)) {
      const position = tabs.indexOf(event.target) + offsets[event.key] + tabs.length;
      target = tabs[position % tabs.length];
    }
    if (target) {
      event.preventDefault();
      selectCity(target.dataset.city, true);
    }
  });

  function contentCard(title, keys, copyLabel, value, className = "") {
    const card = element("section", "content-card " + className);
    const header = element("header", "content-head");
    const titleBox = element("div", "content-title");
    for (const key of keys) titleBox.append(icon(key));
    titleBox.append(element("h4", "", title));
    header.append(titleBox, copyButton(copyLabel, value));
    card.append(header);
    return card;
  }

  function lyricPart(label, lines) {
    const part = element("div", "lyric-segment");
    part.append(element("strong", "", label), element("p", "", lines.join("\n")));
    return part;
  }

  function cityPanel(city) {
    const panel = element("article", "city-panel");
    const banner = element("header", "city-banner");
    const heading = element("div");
    heading.append(element("p", "eyebrow", "四城风物音符"), element("h3", "", city.name));
    banner.append(icon(city.icon), heading, element("span", "token-label", city.token));
    panel.append(banner);

    const profile = [
      ["分舵坐标", city.location],
      ["风物音符", city.token],
      ["实景声音", city.sound],
      ["伴奏与解锁音轨", city.track],
      ["街口寻味地标", city.landmark],
      ["步行指引", city.route]
    ];
    const archive = contentCard("分舵风物与音轨档案", [city.icon], "复制档案", profile.map((row) => row.join("｜")).join("\n"));
    archive.append(facts("facts", profile), sourceLink(city.routeSource));

    const recordingText = [...city.recording, "拨片金句｜" + city.frame, "海报文案｜" + city.poster].join("\n");
    const recording = contentCard("听音寻味 · 拨片定格", ["pick", "street"], "复制脚本", recordingText);
    recording.append(steps(city.recording), facts("facts inline-facts", [["拨片金句", city.frame], ["海报文案", city.poster]]));

    const answer = "自动核验暗号｜" + city.answers[0] + "\n容错同义词｜" + city.answers.slice(1).join("、");
    const storyText = [city.storyTitle, "演出老歌｜" + city.oldSong, ...city.story, answer].join("\n\n");
    const story = contentCard("火塘听曲 · 拉兄弟一把", ["plaque", "capo"], "复制口述与暗号", storyText, "story-card");
    story.append(element("h5", "", city.storyTitle), element("p", "card-meta", "约 2 分钟口述，可直接录制留声木牌。老歌 " + city.oldSong));
    for (const paragraph of city.story) story.append(element("p", "story-para", paragraph));
    story.append(element("p", "cipher", answer), sourceLink(city.storySource));

    const ticket = [city.ticket.notes, city.ticket.line].join("\n");
    const songText = ["《一碗热粥暖皮囊》 · " + city.name, "主歌", ...city.verse, "副歌", ...city.chorus,
      "票面简谱 · 1=C，4/4", ticket, "30 秒过渡串词", city.transition].join("\n");
    const song = contentCard("分城歌词与粮票简谱", ["tear"], "复制歌词与串词", songText, "song-card");
    song.append(lyricPart("主歌", city.verse), lyricPart("副歌", city.chorus));
    const ticketSample = element("div", "ticket-sample");
    ticketSample.append(element("strong", "", "粮票简谱 · 1=C，4/4"), element("p", "music-line", city.ticket.notes), element("p", "", city.ticket.line));
    song.append(ticketSample, quote("30 秒过渡串词", city.transition));

    const seeds = contentCard("种子粮票寄语", ["voice"], "复制全部寄语", city.seeds.join("\n"), "seeds-card");
    const seedList = element("ol", "seed-list");
    for (const seed of city.seeds) {
      const row = element("li", "seed");
      const action = copyButton("复制寄语", seed);
      action.setAttribute("aria-label", "复制寄语：" + seed);
      row.append(element("p", "", seed), action);
      seedList.append(row);
    }
    seeds.append(seedList);

    const grid = element("div", "city-columns");
    grid.append(archive, recording, story, song, seeds);
    panel.append(grid);
    return panel;
  }

  function ensemblePanel(data) {
    const { ensemble, cities } = data;
    const panel = element("article", "city-panel overview-panel");
    const top = element("header", "overview-head");
    const title = element("div");
    title.append(element("p", "eyebrow", "四城共创曲目"), element("h3", "", ensemble.title));
    top.append(title, copyButton("复制四城总谱", [ensemble.title, ensemble.arrangement, ...cities.flatMap(
      (city) => [city.name + " · 主歌", ...city.verse, city.name + " · 副歌", ...city.chorus]
    ), "共同副歌", ...ensemble.common].join("\n")));
    panel.append(top, element("p", "overview-intro", ensemble.introduction));

    const tickets = element("div", "overview-tickets");
    for (const city of cities) {
      const link = element("button", "overview-ticket");
      link.type = "button";
      const text = element("span");
      text.append(element("strong", "", city.name), element("small", "", city.token));
      link.append(icon(city.icon), text);
      link.addEventListener("click", () => selectCity(city.id, true));
      tickets.append(link);
    }
    panel.append(tickets);
    const music = contentCard("合奏安排与共同副歌", ["snow"], "复制共同副歌", [ensemble.arrangement, ...ensemble.common].join("\n"));
    music.append(element("p", "", ensemble.arrangement), lyricPart("共同副歌 · 末段唱两遍", ensemble.common));
    panel.append(music, element("p", "field-note", ensemble.fieldRule));
    return panel;
  }

  function renderCities(data) {
    const items = [
      { id: "ensemble", name: "合奏总览", detail: "四城共熬一碗粥", panel: ensemblePanel(data) },
      ...data.cities.map((city) => ({ id: city.id, name: city.name, detail: city.token, panel: cityPanel(city) }))
    ];
    for (const item of items) {
      const tab = element("button", "city-tab");
      tab.type = "button";
      tab.id = "tab-" + item.id;
      tab.dataset.city = item.id;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "panel-" + item.id);
      tab.append(element("strong", "", item.name), element("span", "", item.detail));
      tab.addEventListener("click", () => selectCity(item.id));
      item.panel.id = "panel-" + item.id;
      item.panel.setAttribute("role", "tabpanel");
      item.panel.setAttribute("aria-labelledby", tab.id);
      item.panel.tabIndex = 0;
      cityTabs.append(tab);
      cityPanels.append(item.panel);
    }
    selectCity(items[0].id);
  }

  function readChecks() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return new Set(Array.isArray(stored) ? stored : []);
    } catch {
      return new Set();
    }
  }

  const checked = readChecks();

  function saveChecks() {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...checked]));
    } catch {
      // 存储受限时，保持当前页面里的勾选。
    }
  }

  function filterable(node, item) {
    node.dataset.roles = item.roles.join(" ");
    return node;
  }

  function taskText(item) {
    const content = element("span");
    content.append(element("strong", "", item.title), element("small", "", item.detail));
    return content;
  }

  function phase(title, description) {
    const section = element("section", "sop-phase");
    const head = element("header", "phase-head");
    const caption = element("div");
    caption.append(element("h3", "", title), element("p", "", description));
    head.append(caption);
    section.append(head);
    return { section, head };
  }

  function renderLabor(metrics) {
    const board = element("section", "labor-board");
    board.append(element("h3", "", "全店人力工时看板"));
    const list = element("dl", "labor-metrics");
    for (const [label, number, unit] of metrics) {
      const item = element("div");
      const value = element("dd");
      value.append(element("strong", "", number), element("span", "", unit));
      item.append(element("dt", "", label), value);
      list.append(item);
    }
    board.append(list);
    document.getElementById("labor").append(board);
  }

  function sopStep(item, roles) {
    const card = filterable(element("article", "sop-card touchpoint"), item);
    const title = element("header", "step-title");
    const headline = element("div");
    headline.append(element("p", "card-meta", item.when), element("h4", "", item.title));
    title.append(icon(item.icon), headline);
    const owners = item.roles.map((id) => roles.find((role) => role.id === id).name).join(" / ");
    card.append(title, element("p", "card-meta", owners), steps(item.steps));
    if (item.script) card.append(quote("指路或现场话术", item.script));
    if (item.source) card.append(sourceLink(item.source));
    return card;
  }

  function renderSop(sop, roles) {
    for (const role of roles) {
      const label = element("label", "role-option");
      const radio = element("input");
      radio.type = "radio";
      radio.name = "sop-role";
      radio.value = role.id;
      radio.checked = role.id === activeRole;
      label.append(radio, element("span", "", role.name));
      roleOptions.append(label);
    }

    const prep = phase("开店前 10 分钟 · 筹备点检", "逐点检查，完成一项即勾选。");
    const checklist = element("div", "sop-card checklist");
    const progressLabel = element("label", "check-progress");
    const progressMessage = element("span");
    progressMessage.setAttribute("role", "status");
    const progress = element("progress");
    progressLabel.append(progressMessage, progress);
    const checkTools = element("div", "check-tools");
    checkTools.append(progressLabel, button("重置全部勾选", () => {
      checked.clear();
      for (const input of checklist.querySelectorAll("input")) input.checked = false;
      saveChecks();
      refreshProgress();
      notify("已清空开店点检");
    }));
    prep.head.append(checkTools);
    prep.section.append(checklist);

    const refreshProgress = () => {
      const visible = sop.prep.filter((item) => activeRole === "all" || item.roles.includes(activeRole));
      const done = visible.filter((item) => checked.has(item.id)).length;
      progress.max = visible.length || 1;
      progress.value = done;
      progressMessage.textContent = "当前岗位已完成 " + done + " / " + visible.length + " 项";
    };

    for (const item of sop.prep) {
      const row = filterable(element("div", "check-row"), item);
      const input = element("input");
      input.type = "checkbox";
      input.id = "check-" + item.id;
      input.checked = checked.has(item.id);
      input.addEventListener("change", () => {
        if (input.checked) checked.add(item.id);
        else checked.delete(item.id);
        saveChecks();
        refreshProgress();
      });
      const label = element("label");
      label.htmlFor = input.id;
      label.append(taskText(item));
      row.append(input, label);
      checklist.append(row);
    }

    const live = phase("营业中 · 三关一匣", "日常闯关由客人自行完成，询问时一句话指路。");
    const touchpoints = element("div", "touchpoints");
    for (const item of sop.live) touchpoints.append(sopStep(item, roles));
    const redeem = sopStep(sop.redeem, roles);
    redeem.classList.add("redeem-card");
    live.section.append(touchpoints, redeem);

    const close = phase("打烊后 5 分钟 · 收尾", "收妥原声与物料，核对礼盒和施粥名单。");
    const closing = element("ul", "sop-card closing-list");
    for (const item of sop.close) {
      const entry = filterable(element("li", "closing-item"), item);
      entry.append(taskText(item));
      closing.append(entry);
    }
    close.section.append(closing);
    const festival = phase("腊八正日 · 红马甲街头民谣施粥行", "店长带金牌总镖头一起上街，边弹唱边为环卫工与异乡人派免费热粥。");
    const festivalCards = element("div", "touchpoints festival-cards");
    for (const item of sop.festival) festivalCards.append(sopStep(item, roles));
    festival.section.append(festivalCards);
    sopContent.append(prep.section, live.section, close.section, festival.section);

    roleOptions.addEventListener("change", (event) => {
      activeRole = event.target.value;
      for (const node of sopContent.querySelectorAll("[data-roles]")) {
        node.hidden = activeRole !== "all" && !node.dataset.roles.split(" ").includes(activeRole);
      }
      refreshProgress();
    });
    refreshProgress();
  }

  function hardwarePreview(item) {
    const preview = element("div", "hardware-preview");
    const art = element("div", "hardware-art");
    const idle = icon(item.icon);
    const active = icon(item.alternate);
    active.hidden = true;
    art.append(idle, active);
    const status = element("span", "preview-status", item.idleLabel);
    status.setAttribute("aria-live", "polite");
    const toggle = button(item.label, () => {
      const playing = active.hidden;
      active.hidden = !playing;
      idle.hidden = playing;
      toggle.setAttribute("aria-pressed", playing);
      status.textContent = playing ? item.activeLabel : item.idleLabel;
    });
    toggle.setAttribute("aria-pressed", "false");
    preview.append(art, status, toggle);
    return preview;
  }

  function renderMaterials(materials) {
    for (const item of materials) {
      const card = element("article", "material-card");
      const title = element("header", "material-title");
      title.append(icon(item.icon), element("h3", "", item.title));
      card.append(title);
      if (item.alternate) card.append(hardwarePreview(item));
      card.append(facts("facts", [
        ["成本预算", item.budget],
        ["摆放位置", item.position]
      ]), element("h4", "", "组装与接线"), steps(item.assembly));
      if (item.proof) card.append(element("p", "ticket-proof", item.proof));
      card.append(facts("facts inline-facts", [["免维护要点", item.maintenance]]));
      if (item.id === "jar") card.querySelector(".hardware-art").append(icon("stamp"));
      materialGrid.append(card);
    }
  }

  function renderContingencies(items) {
    for (const item of items) {
      const scenario = element("details", "scenario");
      scenario.id = "plan-" + item.id;
      const body = element("div", "scenario-body");
      const trigger = element("p");
      trigger.append(element("strong", "", "触发条件"), item.trigger);
      body.append(trigger, element("h4", "", "自助或极简兜底动作"), steps(item.steps), quote("暖心话术", item.script));
      scenario.append(element("summary", "", item.title), body);
      scenarios.append(scenario);
    }
  }

  if (dataSource.themeUrl) {
    const link = element("link");
    link.rel = "stylesheet";
    link.href = dataSource.themeUrl;
    link.addEventListener("error", () => link.remove(), { once: true });
    document.head.append(link);
  }

  const data = dataSource.getData();
  renderCities(data);
  renderLabor(data.labor);
  renderSop(data.sop, data.roles);
  renderMaterials(data.materials);
  renderContingencies(data.contingencies);

  const sectionLinks = Array.from(document.querySelectorAll(".section-nav a"));
  const sections = sectionLinks.map((link) => document.getElementById(link.hash.slice(1)));
  const header = document.querySelector(".site-header");
  function updateNavigation() {
    const threshold = header.offsetHeight + 44;
    let current = 0;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= threshold) current = index;
    });
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      current = sections.length - 1;
    }
    sectionLinks.forEach((link, index) => {
      if (index === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", updateNavigation, { passive: true });
  window.addEventListener("resize", updateNavigation);
  updateNavigation();

  document.getElementById("print-button").addEventListener("click", () => window.print());
  window.addEventListener("beforeprint", () => {
    if (printClosed) return;
    printClosed = Array.from(scenarios.querySelectorAll("details:not([open])"));
    for (const item of printClosed) item.open = true;
  });
  window.addEventListener("afterprint", () => {
    if (!printClosed) return;
    for (const item of printClosed) item.open = false;
    printClosed = null;
  });
}());
