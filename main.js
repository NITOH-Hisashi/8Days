let tokenClient;
let gapiInited = false;
let gisInited = false;

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const calendarId = 'primary';

function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: 'YOUR_API_KEY',
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: 'YOUR_CLIENT_ID',
    scope: SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse.error) throw tokenResponse;
      listUpcomingEvents();
    },
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('signin').innerHTML = '<button onclick="handleAuthClick()">Sign In</button>';
  }
}

function handleAuthClick() {
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

async function listUpcomingEvents() {
  let response;
  try {
    const now = new Date();
    const maxDate = new Date(now);
    maxDate.setDate(now.getDate() + 8);
    response = await gapi.client.calendar.events.list({
      calendarId: calendarId,
      timeMin: now.toISOString(),
      timeMax: maxDate.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
    });
  } catch (err) {
    console.error(err);
    return;
  }

  const events = response.result.items;
  const calendarDiv = document.getElementById('calendar');
  if (!events || events.length === 0) {
    calendarDiv.innerText = '予定は見つかりませんでした。';
    return;
  }

  const ul = document.createElement('ul');
  events.forEach(event => {
    const li = document.createElement('li');
    const when = event.start.dateTime || event.start.date;
    li.textContent = `${when} - ${event.summary}`;
    ul.appendChild(li);
  });
  calendarDiv.appendChild(ul);
}

// 初期化スクリプトの読み込み
const gapiScript = document.createElement('script');
gapiScript.src = 'https://apis.google.com/js/api.js';
gapiScript.onload = gapiLoaded;
document.head.appendChild(gapiScript);

const gisScript = document.createElement('script');
gisScript.src = 'https://accounts.google.com/gsi/client';
gisScript.onload = gisLoaded;
document.head.appendChild(gisScript);
