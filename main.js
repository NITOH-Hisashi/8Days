const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      isSignedIn: false,
      userName: '',
      events: []
    };
  },
  methods: {
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    fetchEvents(token) {
      fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + new Date().toISOString() +
        '&timeMax=' + new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString() +
        '&singleEvents=true&orderBy=startTime', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
        .then(res => res.json())
        .then(data => {
          this.events = data.items || [];
        });
    }
  }
});

app.mount('#app');

window.handleCredentialResponse = (response) => {
  const data = parseJwt(response.credential);
  app._instance.data.userName = data.name;
  app._instance.data.isSignedIn = true;
  app._instance.ctx.fetchEvents(response.credential);
};

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}
