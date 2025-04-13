const CLIENT_ID = GOOGLE_CONFIG.CLIENT_ID;
const API_KEY = GOOGLE_CONFIG.API_KEY;
const DISCOVERY_DOC = GOOGLE_CONFIG.DISCOVERY_DOC;
const SCOPES = GOOGLE_CONFIG.SCOPES;

let tokenClient;

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
    async initializeGapiClient() {
      await new Promise((resolve) => {
        gapi.load('client', async () => {
          await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          });
          resolve();
        });
      });
    },
    async handleAuthClick() {
      if (!tokenClient) {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: async (tokenResponse) => {
            if (tokenResponse.access_token) {
              await this.fetchEvents();
            }
          },
        });
      }
      tokenClient.requestAccessToken();
    },
    async fetchEvents() {
      const now = new Date();
      const maxDate = new Date();
      maxDate.setDate(now.getDate() + 8);

      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: maxDate.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });

      this.events = response.result.items;
    /**
    },
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleString('ja-JP', {
        dateStyle: 'full',
        timeStyle: 'short',
      });
    */
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    /**
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
        */
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
