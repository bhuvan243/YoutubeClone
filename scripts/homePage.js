const API_KEY = "AIzaSyC6wN54_0kCUGum64NtQvuNmfXe26W-rQk";
const BASE_URL = "https://www.googleapis.com/youtube/v3";
const searchInput = document.getElementById("search-bar");
const searchDiv = document.querySelector(".searchIcon-div");
const displayBody = document.getElementById("thumbnails-container");
///////////////////////////////////////////////////

async function fetchData(searchQuery, maxItems) {
  let response = await fetch(
    `${BASE_URL}/search?key=${API_KEY}&q=${searchQuery}&maxResults=${maxItems}&part=snippet`
  );
  let data = await response.json();

  let arr = data.items;

  displayCards(arr, displayBody);
}

window.addEventListener("load", () => {
  fetchData("", 20);
});

searchDiv.addEventListener("click", () => {
  let userInput = searchInput.value;
  fetchData(userInput, 20);

  searchInput.value = "";
});

async function getVideoInfo(videoId) {
  let response = await fetch(
    `${BASE_URL}/videos?key=${API_KEY}&part=statistics&id=${videoId}`
  );
  let data = await response.json();
  return data.items;
}

// getVideoInfo('JhIBqykjzbs');

async function getChannelLogo(channelId) {
  const response = await fetch(
    `${BASE_URL}/channels?key=${API_KEY}&part=snippet&id=${channelId}`
  );
  const data = await response.json();

  return data.items;
}

// get no of subscribers
async function getSubscription(channelid) {
  let response = await fetch(
    `${BASE_URL}/channels?key=${API_KEY}&id=${channelid}&part=statistics`
  );

  let data = await response.json();
  return data.items;
}

async function displayCards(data, displayBody) {
  displayBody.innerHTML = "";
  for (const ele of data) {
    let viewCountObj = await getVideoInfo(ele.id.videoId);
    ele.viewObject = viewCountObj;

    let channelInfoObject = await getChannelLogo(ele.snippet.channelId);
    ele.channelObject = channelInfoObject;

    let subscribers = await getSubscription(ele.snippet.channelId);
    ele.subscriberCount = subscribers;

    let displayDuration = calDuration(ele.snippet.publishedAt);

    let videoCard = document.createElement("div");

    videoCard.className = "thumbnail";
    // videoCard.href = `./html/videoPage.html?videoId=${ele.id.videoId}`;
    // console.log(ele.id.videoId);

    // add data in session storage
    videoCard.addEventListener("click", () => {
      const InfoSelectedVideo = {
        videoTitle: `${ele.snippet.title}`,
        channelLogo: `${ele.channelObject[0].snippet.thumbnails.high.url}`,
        channelName: `${ele.snippet.channelTitle}`,
        channelDescription: `${ele.snippet.description}`,
        likeCount: `${ele.viewObject[0].statistics.viewCount}`,
        channelID: `${ele.snippet.channelId}`,
        subscribers: `${ele.subscriberCount[0].statistics.subscriberCount}`,
      };
      sessionStorage.setItem(
        "selectedVideoInformation",
        JSON.stringify(InfoSelectedVideo)
      );
      window.location.href = "./html/videoPage.html?videoId=" + ele.id.videoId;
    });

    videoCard.innerHTML = `
          <div class="image-container">
              <img src="${
                ele.snippet.thumbnails.high.url
              }" alt="thumbnail-image">
              <div class="video-duration">23:54</div>
          </div>
          <div class="video-details-container">
              <div class="thumbnail-top">
                  <div class="channel-profile-pic">
                      <img src="${
                        ele.channelObject[0].snippet.thumbnails.high.url
                      }" alt="channel-profile-pic">
                  </div>
                  <div class="video-title">${ele.snippet.title}</div>
                  <div class="video-side-menu">:</div>
              </div>
              <div class="channel-name">${ele.snippet.channelTitle}</div>
              <div class="content-details">${calculateViews(
                ele.viewObject[0].statistics.viewCount
              )} views , ${displayDuration} ago</div>
          </div>
          `;

    displayBody.appendChild(videoCard);
  }
}

// calculate duration

function calDuration(publisedDate) {
  let displayTime;
  let publisedAt = new Date(publisedDate);
  let MiliSecFromPublised = publisedAt.getTime();

  let currentTime = new Date();

  let currentTimeInMiliSec = currentTime.getTime();

  let duration = currentTimeInMiliSec - MiliSecFromPublised;

  let days = parseInt(duration / 86400000);

  if (days < 1) {
    let hours = parseInt(duration / 3600000);
    displayTime = hours + " " + "hours";
  } else if (days > 6 && days <= 29) {
    let weeks = parseInt(days / 7);
    displayTime = weeks + " " + "weeks";
  } else if (days > 29 && days <= 364) {
    let months = parseInt(days / 30);
    displayTime = months + " " + "months";
  } else if (days > 364) {
    let years = parseInt(days / 365);
    displayTime = years + " " + "years";
  } else {
    displayTime = days + " " + "days";
  }

  return displayTime;
}

// calculate views

function calculateViews(viewCount) {
  let displayViews;
  if (viewCount < 1000) {
    displayViews = viewCount;
  } else if (viewCount >= 1000 && viewCount <= 999999) {
    displayViews = (viewCount / 1000).toFixed(1) + " " + "K";
  } else if (viewCount >= 1000000) {
    displayViews = (viewCount / 1000000).toFixed(1) + " " + "M";
  }

  return displayViews;
}
