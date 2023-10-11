import moment from 'moment/moment';
import ChatApi from '../chatApi/ChatAPI';

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatApi();
  }

  init() {
    this.bindToDOM();

    this.loginForm = this.container.querySelector('.login-form');
    this.chat = this.container.querySelector('.messenger-container');
    this.userList = this.container.querySelector('.user-list-container');
    this.list = this.container.querySelector('.list');

    this.registerEvents();
  }

  bindToDOM() {
    const html = `
      <div class="container">
        <aside class="user-list-container hidden">
        </aside>
        <form class="messenger-container hidden">
          <ul class="list">
          </ul>
          <input type="text" class="send-message" placeholder="Type your message here">
        </form>
        <form class="login-form">
          <h3 class="login-title">Выберите псевдоним</h3>
          <input class="login-input" type="text">
          <button class="login-button" type="submit">Продолжить</button>
        </form>
      </div>
    `;
    this.container.insertAdjacentHTML('afterbegin', html);
  }

  registerEvents() {
    this.onSubmit = this.onSubmit.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    this.loginForm.addEventListener('submit', this.onSubmit);
    this.chat.addEventListener('submit', this.sendMessage);
  }

  async onSubmit(e) {
    e.preventDefault();

    const name = this.loginForm.querySelector('.login-input').value.trim();
    if (!name) {
      this.showError('You haven\'t inserted any name');
      return;
    }
    const result = await ChatApi.onSubmit(name);
    if (result.status === 'error') {
      this.showError(result.message);
      return;
    }

    this.name = result.user.name;
    this.loginForm.reset();
    this.switch();
    this.addUserAside(this.name);
    this.subscribeOnEvents();
  }

  subscribeOnEvents() {
    this.ws = new WebSocket('ws://localhost:7070/ws');
    this.ws.addEventListener('open', (e) => {
      console.log('open');
      console.log(e);
    });

    this.ws.addEventListener('close', (e) => {
      console.log(e);
    });

    this.ws.addEventListener('error', (e) => {
      console.log(e);
    });

    this.ws.addEventListener('message', (e) => {
      console.log(e);

      const data = JSON.parse(e.data);
      console.log(data);
    });
  }

  sendMessage(e) {
    e.preventDefault();

    this.input = this.chat.querySelector('.send-message');
    const message = this.input.value;
    if (!message) {
      this.showError('Message is empty');
      return;
    }
    this.ws.send(message);
    this.input.value = '';
  }

  renderMessage(user, message) {
    const time = moment.now().format('HH:MM DD.MM.YYYY');
    const html = `
      <li class="message message-active">
        <span class="user-info user-info-active">${user}  ${time}</span>
        <div class="user-message">${message}</div>
      </li>
    `;
    this.list.insertAdjacentHTML('afterbegin', html);
  }

  addUserAside(name) {
    const html = `
    <div class="user user-${name}">
      <div class="user-circle"></div>
      <div class="user-name">${name}</div>
    </div>
    `;
    this.userList.insertAdjacentHTML('afterbegin', html);
    const userCircle = this.userList.querySelector(`.user-${name}`).querySelector('.user-circle');
    userCircle.classList.add('user-active');
  }

  switch() {
    this.loginForm.classList.toggle('hidden');
    this.chat.classList.toggle('hidden');
    this.userList.classList.toggle('hidden');
  }

  showError(message) {
    const error = `<div class="error">${message}</div>`;
    this.container.insertAdjacentHTML('afterbegin', error);
    setTimeout(() => this.container.querySelector('.error').remove(), 3000);
  }
}
