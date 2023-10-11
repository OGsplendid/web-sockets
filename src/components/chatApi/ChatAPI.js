export default class ChatApi {
  static async onSubmit(name) {
    const onSendData = {
      name,
    };

    const response = await fetch('http://localhost:7070/new-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(onSendData),
    });
    const result = await response.json();
    return result;
  }
}
