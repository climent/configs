const STATUS_URL = 'https://hayahora.futbol/estado/data.json';
const SITE_URL = 'https://hayahora.futbol/';

async function updateStatus() {
  try {
    const response = await fetch(STATUS_URL);
    const data = await response.json();
    
    // Logic: If there are active blocks, soccer is on.
    const isSoccer = data.current && Object.keys(data.current).length > 0;

    const text = isSoccer ? "SI" : "NO";
    const color = isSoccer ? "#22c55e" : "#ef4444"; 

    chrome.action.setBadgeText({ text: text });
    chrome.action.setBadgeBackgroundColor({ color: color });
  } catch (error) {
    console.error('Error fetching soccer status:', error);
    chrome.action.setBadgeText({ text: "?" });
    chrome.action.setBadgeBackgroundColor({ color: "#6b7280" });
  }
}

// FEATURE: Open the website when the icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: SITE_URL });
});

// Check immediately on startup
chrome.runtime.onInstalled.addListener(() => {
  updateStatus();
  chrome.alarms.create('checkSoccer', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkSoccer') {
    updateStatus();
  }
});
