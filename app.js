const tg = window.Telegram.WebApp;
tg.ready();

document.getElementById("status").innerText =
  "Открыто из Telegram ✅";

const user = tg.initDataUnsafe?.user;

const list = document.getElementById("list");

if (user) {
  list.innerHTML = `
    <div class="card">
      <b>Пользователь:</b><br>
      ${user.first_name || ""} ${user.last_name || ""}<br>
      <span class="muted">ID: ${user.id}</span>
    </div>

    <button onclick="buy()">Купить ⭐</button>
  `;
} else {
  list.innerHTML = "<div class='card'>Открыто не из Telegram</div>";
}

function buy() {
  tg.showAlert("Покупка в разработке 🚀");
}
