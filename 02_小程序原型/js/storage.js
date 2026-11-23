(function (root) {
  "use strict";

  const data = root.EscortData;
  const keys = Object.freeze({
    state: "fengxue.escort.state.v2",
    outbox: "fengxue.bridge.outbox.v1",
    inbox: "fengxue.bridge.inbox.v1"
  });
  const eventName = "fengxue:escort-event";
  const inboxEvent = "fengxue:pigeon-inbox";
  let cache = null;
  let persistent = true;

  function read(key) {
    try {
      return JSON.parse(root.localStorage.getItem(key));
    } catch (error) {
      if (!(error instanceof SyntaxError)) persistent = false;
      return null;
    }
  }

  function write(key, value) {
    try {
      root.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      persistent = false;
      return false;
    }
  }

  function createState() {
    const previous = read("fengxue.escort.state.v1");
    const requested = data.scanCity(new URLSearchParams(root.location.search).get("station"));
    return {
      version: 2, revision: 0,
      profile: { nickname: previous?.profile?.nickname || "风雪镖师 " + (100 + Math.floor(Math.random() * 900)), stationId: requested?.id || data.cities[0].id },
      routes: Object.fromEntries(data.cities.map(city => [city.id, {
        startedAt: null, hunt: null, heardAt: null, pouredAt: null, stampedAt: null, tickets: {},
        credential: null, redemption: null, signup: null
      }])),
      outgoing: [], incoming: [], events: [],
      sound: true, demoStock: true
    };
  }

  // Match only the old supplied templates. Visitors' own words and recordings stay intact.
  const previousGreetings = [
    "桥下有人收橹，桥上有人往回走。山塘街捎你一撮桂花。",
    "你要还没找到回家的票，坐稳了听这十秒。河面上的灯没灭。",
    "不问你从哪条路过来。碗腾出来了，接过时手别贴碗底。",
    "桂花浮在粥上，我用琴弹了一下水纹。寄到你那边还是暖的吗？",
    "今天我说到家了，你也可以晚一点报平安。山塘街等得起。"
  ];
  function migrateRecord(record) {
    if (!record) return;
    if (record.fromCityId === "suzhou") {
      const city = data.city("xitang");
      const oldBody = root.EscortSimplify(record.body || "");
      const index = previousGreetings.indexOf(oldBody);
      if (index >= 0) record.body = city.seeds[index];
      if (record.ticket) record.ticket = { ...record.ticket, landmark: city.site, token: city.token, notes: city.ticket.notes, lyric: city.ticket.line };
    }
    for (const field of ["fromCityId", "toCityId", "routeId", "stationId"]) {
      if (record[field] === "suzhou") record[field] = "xitang";
    }
    if (record.audio?.kind === "demo" && record.audio.cityId === "suzhou") record.audio.cityId = "xitang";
  }

  function migrateStation(saved) {
    const routes = saved.routes;
    if (!routes || !(routes.suzhou || saved.profile?.stationId === "suzhou" || Object.values(routes).some(route => route.tickets?.suzhou))) return false;
    if (routes.suzhou) {
      const current = routes.xitang || {};
      for (const [field, value] of Object.entries(routes.suzhou)) current[field] ??= value;
      current.tickets = { ...routes.suzhou.tickets, ...current.tickets };
      routes.xitang = current;
      delete routes.suzhou;
    }
    migrateRecord(saved.profile);
    for (const route of Object.values(routes)) {
      if (route.tickets?.suzhou) {
        route.tickets.xitang ??= route.tickets.suzhou;
        delete route.tickets.suzhou;
      }
      migrateRecord(route.credential);
    }
    saved.incoming?.forEach(migrateRecord);
    saved.outgoing?.forEach(migrateRecord);
    saved.events?.forEach(event => migrateRecord(event.payload));
    return true;
  }

  function load() {
    const saved = persistent ? read(keys.state) : null;
    if (saved?.version === 2 && migrateStation(saved)) write(keys.state, saved);
    if (saved?.version === 2 && data.city(saved.profile?.stationId) && saved.routes) {
      if (data.cities.some(city => !saved.routes[city.id])) {
        saved.routes = { ...createState().routes, ...saved.routes };
        write(keys.state, saved);
      }
      cache = saved;
    }
    if (!cache) {
      cache = createState();
      write(keys.state, cache);
    }
    return cache;
  }

  function mirrorOutbox(state) {
    const target = { schemaVersion: 1, events: state.events };
    const current = read(keys.outbox);
    if (JSON.stringify(current) === JSON.stringify(target) || (!current && !state.events.length)) return;
    write(keys.outbox, target);
  }

  function update(revise) {
    const state = JSON.parse(JSON.stringify(load()));
    const oldEventCount = state.events.length;
    const result = revise(state);
    if (result === false) return false;
    state.revision++;
    cache = state;
    if (write(keys.state, state) && state.events.length > oldEventCount) mirrorOutbox(state);
    // 03 可监听同页事件，或从同源页面监听 outbox 的 storage 变化。
    // 实际云打印应按 event.id 去重并由服务端签发票码、音频地址及核销凭证。
    for (const event of state.events.slice(oldEventCount)) root.dispatchEvent(new CustomEvent(eventName, { detail: event }));
    return result;
  }

  function id() {
    return root.crypto.randomUUID?.() || Array.from(root.crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("");
  }

  function appendEvent(state, type, payload, occurredAt = new Date().toISOString()) {
    state.events.push({ schemaVersion: 1, id: id(), type, source: "02_小程序原型", occurredAt, payload });
  }

  function sampleAudio(cityId) {
    return { kind: "demo", cityId, durationSeconds: 10, consent: true };
  }

  function validAudio(audio, cityId) {
    if (audio?.kind === "demo" && audio.consent === true) return sampleAudio(cityId);
    if (audio?.kind !== "recorded" || audio.consent !== true) return null;
    if (typeof audio.dataUrl !== "string" || audio.dataUrl.length > 180000 ||
        !/^data:audio\/(webm|mp4|ogg|wav|mpeg)(?:;codecs=[\w.,-]+)?;base64,[A-Za-z0-9+/=]+$/.test(audio.dataUrl)) return null;
    if (typeof audio.durationSeconds !== "number" || audio.durationSeconds <= 0 || audio.durationSeconds > 10) return null;
    return { kind: "recorded", durationSeconds: audio.durationSeconds, consent: true, dataUrl: audio.dataUrl };
  }

  function syncInbox() {
    const envelope = read(keys.inbox);
    if (envelope?.schemaVersion !== 1 || !Array.isArray(envelope.messages)) return false;
    return update(state => {
      let changed = false;
      for (const message of envelope.messages) {
        migrateRecord(message);
        const from = data.city(message?.fromCityId);
        const to = data.city(message?.toCityId);
        if (!from || !to || from === to || typeof message.id !== "string" || !message.id.trim() ||
            typeof message.body !== "string" || !message.body.trim() || !Number.isFinite(Date.parse(message.createdAt)) ||
            state.incoming.some(letter => letter.id === message.id)) continue;
        state.incoming.push({
          id: message.id, fromCityId: from.id, toCityId: to.id,
          author: typeof message.author === "string" ? message.author.trim().slice(0, 24) || "远方镖师" : "远方镖师",
          tag: typeof message.tag === "string" ? message.tag.slice(0, 16) : "民谣粮票",
          body: Array.from(message.body.trim()).slice(0, data.post.maxLength).join(""),
          createdAt: new Date(message.createdAt).toISOString(),
          replyTo: typeof message.replyTo === "string" ? message.replyTo : null,
          source: Object.hasOwn(data.post.sources, message.source) ? message.source : "live",
          audio: validAudio(message.audio, from.id),
          resonatedAt: null, readAt: null
        });
        changed = true;
      }
      return changed;
    });
  }

  function reset() {
    for (const key of Object.values(keys)) {
      try {
        root.localStorage.removeItem(key);
      } catch {
        persistent = false;
      }
    }
    cache = createState();
    write(keys.state, cache);
  }

  root.EscortStore = { keys, inboxEvent, load, update, reset, id, appendEvent, sampleAudio, validAudio, syncInbox,
    repairOutbox: () => mirrorOutbox(load()), persisted: () => persistent };
})(window);
