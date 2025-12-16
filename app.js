(() => {
  "use strict";

  // Безопасно получаем Telegram WebApp (если открыли не из Telegram — тоже не упадёт)
  const tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;

  // Твои пакеты
  const PACKS = [
    { stars: 50,  rub: 70  },
    { stars: 75,  rub: 105 },
    { stars: 100, rub: 140 },
    { stars: 150, rub: 210 },
    { stars: 250, rub: 350 },
    { stars: 350, rub: 490 },
    { stars: 500, rub: 700 },
    { stars: 750, rub: 1050 },
    { stars: 1000, rub: 1350 },
    { stars: 1500, rub: 2025 },
  ];

  // Реквизиты
  const PAY_DETAILS = {
    phone: "89081756744",
    bank: "Т-Банк",
    name: "Данил Ц",
  };

  // Глобальный ловец ошибок — чтобы Telegram на Android не “вылетал молча”
  window.addEventListener("error", (e) => {
    try {
      showError("Произошла ошибка в приложении. Попробуй ещё раз.");
      console.error(e?.error || e);
    } catch (_) {}
  });

  document.addEventListener("DOMContentLoaded", () => {
    try {
      if (tg) {
        tg.ready();
        try { tg.expand(); } catch (_) {}
      }
      render();
      bind();
      updateUi();
    } catch (err) {
      console.error(err);
      showError("Не удалось загрузить приложение. Обнови страницу.");
    }
  });

  let selectedPack = null;

  function render() {
    // Полностью рисуем интерфейс сами — так не зависит от старого HTML
    document.body.innerHTML = `
      <style>
        :root { color-scheme: dark; }
        body {
          margin: 0; padding: 18px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          background: #0b0b0f; color: #fff;
        }
        .wrap { max-width: 520px; margin: 0 auto; }
        .top { display:flex; align-items:center; gap:10px; margin-bottom: 10px; }
        .badge { width: 34px; height: 34px; border-radius: 10px; display:flex; align-items:center; justify-content:center;
                 background: rgba(255,255,255,0.08); font-size: 18px; }
        h1 { font-size: 22px; margin: 0; }
        .sub { opacity: .75; margin: 10px 0 16px 0; }
        .grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .btn {
          border: 0; cursor: pointer;
          padding: 14px 14px; border-radius: 14px;
          background: rgba(255,255,255,0.08);
          color:#fff; font-size: 18px;
          display:flex; justify-content: space-between; align-items:center;
        }
        .btn:active { transform: scale(0.99); }
        .btn.sel { outline: 2px solid rgba(255,255,255,0.35); background: rgba(255,255,255,0.12); }
        .card {
          margin-top: 14px;
          background: rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 14px;
        }
        label { display:block; opacity:.85; margin-bottom: 6px; }
        input {
          width: 100%;
          padding: 12px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(0,0,0,0.25);
          color: #fff;
          font-size: 16px;
          outline: none;
        }
        .hint { opacity: .7; font-size: 13px; margin-top: 8px; line-height: 1.35; }
        .error { margin-top: 10px; color: #ffb4b4; background: rgba(255,0,0,0.08); padding: 10px; border-radius: 12px; display:none; }
        .primary {
          width:100%;
          margin-top: 12px;
          padding: 14px;
          border-radius: 14px;
          border: 0;
          font-size: 16px;
          cursor: pointer;
          background: #ffffff;
          color: #000;
          font-weight: 700;
          opacity: 0.45;
        }
        .primary.enabled { opacity: 1; }
        .paybox { display:none; margin-top: 12px; }
        .row { display:flex; gap:10px; flex-wrap: wrap; }
        .mini {
          border: 0;
          cursor: pointer;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.10);
          color:#fff;
          font-size: 14px;
        }
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
        .ok { margin-top: 10px; color: #b7ffb7; background: rgba(0,255,0,0.08); padding: 10px; border-radius: 12px; display:none; }
      </style>

      <div class="wrap">
        <div class="top">
          <div class="badge">⭐</div>
          <div>
            <h1>SirakStars</h1>
            <div class="sub">Выбери количество звёзд и введи свой username</div>
          </div>
        </div>

        <div id="packs" class="grid"></div>

        <div class="card">
          <label for="username">Твой Telegram username</label>
          <input id="username" type="text" inputmode="text" autocomplete="off" placeholder="@username" />
          <div class="hint">Можно с @ или без. Пример: <span class="mono">@danil</span></div>

          <div id="err" class="error"></div>

          <button id="showPay" class="primary" type="button">Показать реквизиты</button>

          <div id="paybox" class="paybox">
            <div class="hint" style="margin-top:12px;">
              Переведи <b id="sum"></b> на реквизиты ниже.<br/>
              В комментарии к переводу (если есть) можно указать: <span class="mono" id="cmt"></span>
            </div>

            <div class="card" style="margin-top:12px;">
              <div><b>Реквизиты</b></div>
              <div class="hint" style="margin-top:8px;">
                <div>Телефон: <span class="mono" id="payPhone"></span></div>
                <div>Банк: <span class="mono" id="payBank"></span></div>
                <div>Получатель: <span class="mono" id="payName"></span></div>
              </div>

              <div class="row" style="margin-top:12px;">
                <button id="copyAll" class="mini" type="button">Скопировать реквизиты</button>
                <button id="copySum" class="mini" type="button">Скопировать сумму</button>
              </div>

              <div id="ok" class="ok"></div>
            </div>

            <div class="hint" style="margin-top:10px;">
              После оплаты — просто напиши мне в личку/чат, и я вручную отправлю звёзды.
            </div>
          </div>
        </div>
      </div>
    `;

    // Рисуем кнопки пакетов
    const packsEl = document.getElementById("packs");
    packsEl.innerHTML = PACKS.map((p, i) => `
      <button class="btn" type="button" data-i="${i}">
        <span>${p.stars} ⭐</span>
        <span>${p.rub} ₽</span>
      </button>
    `).join("");
  }

  function bind() {
    // Выбор пакета
    document.getElementById("packs").addEventListener("click", (e) => {
      try {
        const btn = e.target.closest(".btn");
        if (!btn) return;
        const i = Number(btn.getAttribute("data-i"));
        selectedPack = PACKS[i] || null;
        updateUi();
      } catch (err) {
        console.error(err);
        showError("Не получилось выбрать пакет. Попробуй ещё раз.");
      }
    });

    // Ввод юзернейма
    document.getElementById("username").addEventListener("input", () => {
      try {
        clearError();
        updateUi();
      } catch (_) {}
    });

    // Показать реквизиты
    document.getElementById("showPay").addEventListener("click", () => {
      try {
        clearError();

        const usernameRaw = (document.getElementById("username").value || "").trim();
        const username = normalizeUsername(usernameRaw);

        if (!selectedPack) {
          return showError("Сначала выбери количество звёзд.");
        }
        if (!username) {
          return showError("Сначала введи username (например: @danil).");
        }

        // Показываем блок оплаты
        const paybox = document.getElementById("paybox");
        paybox.style.display = "block";

        document.getElementById("sum").textContent = `${selectedPack.rub} ₽ за ${selectedPack.stars} ⭐`;
        document.getElementById("cmt").textContent = username;

        document.getElementById("payPhone").textContent = PAY_DETAILS.phone;
        document.getElementById("payBank").textContent = PAY_DETAILS.bank;
        document.getElementById("payName").textContent = PAY_DETAILS.name;

        // На Android иногда помогает “скролл к блоку”, чтобы не было глюков
        paybox.scrollIntoView({ behavior: "smooth", block: "start" });

      } catch (err) {
        console.error(err);
        showError("Ошибка при показе реквизитов. Попробуй ещё раз.");
      }
    });

    // Копирование
    document.getElementById("copyAll").addEventListener("click", async () => {
      try {
        const text = `Оплата: ${PAY_DETAILS.phone} (${PAY_DETAILS.bank}) ${PAY_DETAILS.name}`;
        await safeCopy(text);
        showOk("Реквизиты скопированы ✅");
      } catch (err) {
        console.error(err);
        showOk("Не удалось скопировать. Скопируй вручную ✅");
      }
    });

    document.getElementById("copySum").addEventListener("click", async () => {
      try {
        if (!selectedPack) return;
        await safeCopy(String(selectedPack.rub));
        showOk("Сумма скопирована ✅");
      } catch (err) {
        console.error(err);
        showOk("Не удалось скопировать. Скопируй вручную ✅");
      }
    });
  }

  function updateUi() {
    // Подсветка выбранного пакета
    const buttons = Array.from(document.querySelectorAll(".btn"));
    buttons.forEach((b) => b.classList.remove("sel"));

    if (selectedPack) {
      const idx = PACKS.findIndex(p => p.stars === selectedPack.stars && p.rub === selectedPack.rub);
      if (idx >= 0 && buttons[idx]) buttons[idx].classList.add("sel");
    }

    // Кнопка “Показать реквизиты”
    const usernameRaw = (document.getElementById("username").value || "").trim();
    const username = normalizeUsername(usernameRaw);

    const showPay = document.getElementById("showPay");
    const enabled = Boolean(selectedPack && username);
    showPay.classList.toggle("enabled", enabled);
    showPay.style.opacity = enabled ? "1" : "0.45";
  }

  function normalizeUsername(s) {
    // Разрешаем: @username или username (латиница/цифры/подчёркивание)
    if (!s) return "";
    let u = s.trim();
    if (u.startsWith("@")) u = u.slice(1);
    // Telegram username: 5..32 символа, буквы/цифры/_
    // (мы делаем мягче: 3..32, чтобы не “вылетало” на тестах)
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(u)) return "";
    return "@" + u;
  }

  function showError(msg) {
    const el = document.getElementById("err");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
  }

  function clearError() {
    const el = document.getElementById("err");
    if (!el) return;
    el.textContent = "";
    el.style.display = "none";
  }

  function showOk(msg) {
    const el = document.getElementById("ok");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    setTimeout(() => { el.style.display = "none"; }, 2500);
  }

  async function safeCopy(text) {
    // Clipboard API может быть заблокирован на некоторых Android WebView — поэтому try/catch
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // Фолбэк
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
})();
