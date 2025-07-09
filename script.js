
const Senha = "284938i73f";
const perguntaSenha = prompt("Digite a senha:");
localStorage.removeItem("chatHistory")
if (perguntaSenha !== Senha) {
  alert("Senha errada");
  throw new Error("Acesso negado");
}

const loginSec = document.querySelector(".login");
const loginForm = document.querySelector(".login__form");
const loginInput = document.querySelector(".login__input");

const chatSec = document.querySelector(".chat");
const chatForm = document.querySelector(".chat__form");
const chatInput = document.querySelector(".chat__input");
const chatMessages = document.querySelector(".chat__messages");

const colors = ["green", "blue", "aqua", "coral", "red", "pink"];
const user = { id: "", name: "", color: "" };
let websocket;

function loadChatHistory() {
  return JSON.parse(localStorage.getItem("chatHistory")) || [];
}
function saveChatHistory(history) {
  localStorage.setItem("chatHistory", JSON.stringify(history));

}

function createMessageSelfElement(content) {
  const div = document.createElement("div");
  div.classList.add("message--self");
  div.textContent = content;
  return div;
}
function createMessageOtherElement(content, sender, senderColor) {
  const div = document.createElement("div");
  const span = document.createElement("span");
  div.classList.add("message--other");
  span.classList.add("message--sender");
  span.style.color = senderColor;
  span.textContent = sender + ": ";
  div.append(span);
  div.append(content);
  return div;
}
function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}
function scrollScreen() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function processMessage(event) {
  const msg = JSON.parse(event.data);
  const elem = (msg.userId === user.id)
    ? createMessageSelfElement(msg.content)
    : createMessageOtherElement(msg.content, msg.userName, msg.userColor);

  chatMessages.appendChild(elem);
  scrollScreen();

  const history = loadChatHistory();
  history.push(msg);
  saveChatHistory(history);
}

function handleSubmit(event) {
  event.preventDefault();
  user.id = crypto.randomUUID();
  user.name = loginInput.value.trim();
  user.color = getRandomColor();

  loginSec.style.display = "none";
  chatSec.style.display = "flex";

  const history = loadChatHistory();
  history.forEach(msg => {
    const elem = (msg.userId === user.id)
      ? createMessageSelfElement(msg.content)
      : createMessageOtherElement(msg.content, msg.userName, msg.userColor);
    chatMessages.appendChild(elem);
  });
  scrollScreen();

  websocket = new WebSocket("wss://chatcomsenha-grfd.onrender.com");
  websocket.onmessage = processMessage;
}

function sendMessage(event) {
  event.preventDefault();
  const content = chatInput.value.trim();
  if (!content) return;

  const msgObj = {
    userId: user.id,
    userName: user.name,
    userColor: user.color,
    content
  };

  websocket.send(JSON.stringify(msgObj));
  chatInput.value = "";
}

loginForm.addEventListener("submit", handleSubmit);
chatForm.addEventListener("submit", sendMessage);
