const tg = window.Telegram.WebApp;
tg.ready();

// Основной контейнер
document.body.style.background = "#0f0f0f";
document.body.style.color = "#fff";
document.body.style.fontFamily = "system-ui, sans-serif";
document.body.style.padding = "16px";

const PRICES = [
  { stars: 50, price: 70 },
  { stars: 75, price: 105 },
  { stars: 100, price: 140 },
  { stars: 150, price: 210 },
  { stars: 250, price: 350 },
  { stars: 350, price: 490 },
  { stars: 500, price: 700 },
  { stars: 750, price: 1050 },
  { stars: 1000, price: 1350 },
  { stars: 1500, price: 2025 },
];

let selected = null;

const app = document.createElement("div");
document.body.appendChild(app);

app.innerHTML = `
  <h2 style="text-align:center;">⭐ SirakStars</h2>
  <p style="text-align:center;opacity:.8;">Выбери количество звёзд</p>

  <div id="prices"></div>

  <div style="margin-top:16px;">
    <input
      id="username"
      placeholder="Ваш Telegram @username"
      style="
        width:100%;
        padding:12px;
        border-radius:10px;
        border:none;
        font-size:16px;
        margin-bottom:10px;
      "
    />
    <button
      id="payBtn"
      disabled
      style="
        width:100%;
        padding:14px;
        border-radius:12px;
        border:none;
        font-size:18px;
        background:#444;
        color:#999;
      "
    >
      Получить реквизиты
    </button>
  </div>

  <div id="result" style="margin-top:16px;"></div>
`;

const pricesDiv = document.getElementById("prices");
const payBtn = document.getElementById("payBtn");
const result = document.getElementById("result");

PRICES.forEach(p => {
  const btn = document.createElement("button");
  btn.innerText = `${p.stars} ⭐ — ${p.price} ₽`;
  btn.style.cssText = `
    width:100%;
    padding:12px;
    margin:6px 0;
    border-radius:12px;
    border:none;
    font-size:16px;
    background:#1f1f1f;
    color:#fff;
  `;
  btn.onclick = () => {
    selected = p;
    payBtn.disabled = false;
    payBtn.style.background = "#2ea043";
    payBtn.style.color = "#fff";
    result.innerHTML = "";
  };
  pricesDiv.appendChild(btn);
});

payBtn.onclick = () => {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    tg.showAlert("Введите Telegram username");
    return;
  }

  result.innerHTML = `
    <div style="
      background:#1a1a1a;
      padding:16px;
      border-radius:14px;
    ">
      <h3>💳 Оплата вручную</h3>
      <p>Переведите <b>${selected.price} ₽</b></p>

      <p>
        📱 <b>89081756744</b><br>
        🏦 Т-Банк<br>
        👤 Данил Ц
      </p>

      <p>
        📝 Комментарий к переводу:<br>
        <b>${username}</b>
      </p>

      <p style="opacity:.7;">
        После оплаты ожидайте — звёзды будут отправлены вручную.
      </p>
    </div>
  `;

  tg.sendData(JSON.stringify({
    user: username,
    stars: selected.stars,
    price: selected.price
  }));
};
