const storedData = JSON.parse(sessionStorage.getItem('selectedVideoInformation'));
console.log(storedData);

const channelLogo = document.getElementById('channel-logo');
const channelName = document.getElementById('channel-name');
const subscriberCountElement = document.getElementById('subscribers-count');

const subscriberCount = calculateLikes(storedData.subscribers);

channelLogo.setAttribute('src', storedData.channelLogo);
channelName.innerText = storedData.channelName;
subscriberCountElement.innerText = `${subscriberCount} subscribers`;