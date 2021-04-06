/**
 * Declare initial variables
 */
const xhr = new XMLHttpRequest();
let amt = marketcap = high = low = percentage = dailyvolume = 0;

/**
 * All data about COPE price comes from Coingecko API.
 */
const COINGECKO_COPE_PRICE_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=cope&order=market_cap_desc&per_page=100&page=1&sparkline=false"

/**
 * setBadge
 * --------
 * Sets badge with the current price of COPE.
 */
const setBadge = (amt) => {
  chrome.browserAction.setBadgeText({
    text: String(amt)
  })
};

/**
 * sendPriceMsg
 * -------------
 * Sends a message from background.js to a listener in popup.js with the current COPE price.
 */
const sendPriceMsg = (amt, marketcap, high, low, percentage, dailyvolume) => {
  chrome.runtime.sendMessage({
    action: 'send_price',
    msg: amt
  },
  {
    action: 'send_marketcap',
    msg: marketcap
  },
  {
    action: 'send_high',
    msg: high
  },
  {
    action: 'send_low',
    msg: low
  },
  {
    action: 'send_percentage',
    msg: percentage
  },
  {
    action: 'send_dailyvolume',
    msg: dailyvolume
  }
  
  );
};

/**
 * fetchPrice
 * ----------
 * Fetches current COPE price from Coingecko API.
 * Sets badge number to price of COPE.
 * Sends price data to popup.js to display in the extension popup.
 */
const fetchPrice = () => {
  xhr.open("GET", COINGECKO_COPE_PRICE_URL, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      const resp = JSON.parse(xhr.responseText);
      const {current_price, market_cap, high_24h, low_24h, total_volume, price_change_percentage_24h } = resp[0];
      amt = current_price;
      marketcap = market_cap;
      high = high_24h;
      low = low_24h;
      percentage = price_change_percentage_24h;
      dailyvolume = total_volume;
      setBadge(current_price);
      sendPriceMsg(current_price);
    }
  }
  xhr.send();
};

/**
 * fetch listener
 * --------------
 * Adds listener for price fetch requests from popup.js.
 */
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  if (msg.action === 'fetch_price') {
    response(amt);
  }
  else if (msg.action === 'fetch_marketcap') {
    response(marketcap);
  }
  else if (msg.action === 'fetch_high') {
    response(high);
  }
  else if (msg.action === 'fetch_low') {
    response(low);
  }
  else if (msg.action === 'fetch_percentage') {
    response(percentage);
  }
  else if (msg.action === 'fetch_dailyvolume') {
    response(dailyvolume);
  }
});

/**
 * Init
 */
fetchPrice();

/**
 * Poll for prices every 5 seconds.
 */
setInterval(fetchPrice, 5000);
