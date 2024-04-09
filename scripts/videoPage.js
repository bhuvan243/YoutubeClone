let urlParam = new URLSearchParams(window.location.search);

let videoID = urlParam.get("videoId");
let VideoContainer = document.getElementById("video-container");

function onPlayerReady(event) {
  event.target.playVideo();
}
window.addEventListener("load", () => {
  if (YT) {
    new YT.Player(VideoContainer, {
      height: "400",
      width: "100%",
      videoId: videoID,
      events: {
        onReady: onPlayerReady,
      },
    });
  }
});

// store data on session storage
let getSelectedVideoInfo;

const videoInfoString = sessionStorage.getItem("selectedVideoInformation");
if (videoInfoString) {
  getSelectedVideoInfo = JSON.parse(videoInfoString);
}

//calculate like count

function calculateLikes(likeCount) {
  let displayViews;
  // let count;
  if (likeCount < 1000) {
    displayViews = likeCount;
  } else if (likeCount >= 1000 && likeCount <= 999999) {
    displayViews = (likeCount / 1000).toFixed(1) + " " + "K";
  } else if (likeCount >= 1000000) {
    displayViews = (likeCount / 1000000).toFixed(1) + " " + "M";
  }

  return displayViews;
}

// console.log(getSelectedVideoInfo);
let correctLikeCount = calculateLikes(getSelectedVideoInfo.likeCount);
let correctSubscriberCount = calculateLikes(getSelectedVideoInfo.subscribers);
document.getElementById(
  "sug-filter"
).innerText = `From ${getSelectedVideoInfo.channelName}`;
document.getElementById("video-title").innerText =
  getSelectedVideoInfo.videoTitle;
document.getElementById("like-count").innerText = correctLikeCount;
document
  .getElementById("channel-logo")
  .setAttribute("src", getSelectedVideoInfo.channelLogo);
document.getElementById("channel-name").innerText =
  getSelectedVideoInfo.channelName;
document.getElementById(
  "subscribers-count"
).innerText = `${correctSubscriberCount} subscribers`;
document.getElementById(
  "channel-description"
).innerText = `${getSelectedVideoInfo.channelDescription}`;

// get comments
async function getComments(specificvideoID) {
  try {
    let response = await fetch(
      `${BASE_URL}/commentThreads?key=${API_KEY}&videoId=${specificvideoID}&maxResults=20&part=snippet`
    );
    const data = await response.json();

    let commentsArr = data.items;

    // console.log(commentsArr);
    displayComments(commentsArr);
  } catch (err) {
    console.log(err);
  }
}

getComments(videoID);

let userCommentDiv = document.getElementById("comments-body");

function displayComments(dataItems) {
  userCommentDiv.innerHTML = "";
  for (let ele of dataItems) {
    // console.log(ele);
    let individualCommentDiv = document.createElement("div");
    individualCommentDiv.className = "user-comment";
    individualCommentDiv.innerHTML = `
    <img src="${ele.snippet.topLevelComment.snippet.authorProfileImageUrl}" alt="user-profile-pic">
    <div class="comment-details">
        <div>
            <span id="user-name">${ele.snippet.topLevelComment.snippet.authorDisplayName}</span>
            <span id="commented-time">8 hours ago</span>
        </div>
        <div id="comment-content">${ele.snippet.topLevelComment.snippet.textDisplay}</div>
        <div class="comment-data">
            <img src="../Assets/videoPage/Liked.svg" alt="like-button">
            <span id="comment-like-count">${ele.snippet.topLevelComment.snippet.likeCount}</span>
            <img src="../Assets/videoPage/DisLiked.svg" alt="dislike-button">
            <span id="reply-btn">Reply</span>
        </div>
    </div>
    `;

    userCommentDiv.appendChild(individualCommentDiv);
  }
}

// get recommended videos

let recommendedSectionDiv = document.getElementById("suggestions-list");
async function getRecommendedVideos(videoTitle) {
  try {
    let response = await fetch(
      `${BASE_URL}/search?key=${API_KEY}&q=${videoTitle}&maxResults=10&part=snippet`
    );
    let data = await response.json();
    let dataList = data.items;

    displayRecommendedData(dataList);
    // console.log(dataList);
  } catch (err) {
    console.log(err);
  }
}
getRecommendedVideos(getSelectedVideoInfo.videoTitle);

async function displayRecommendedData(data) {
  recommendedSectionDiv.innerHTML = "";
  for (const ele of data) {
    let viewCountObj = await getVideoInfo(ele.id.videoId);
    ele.viewObject = viewCountObj;

    let channelInfoObject = await getChannelLogo(ele.snippet.channelId);
    ele.channelObject = channelInfoObject;

    let displayDuration = calDuration(ele.snippet.publishedAt);

    let recommendedVideoCard = document.createElement("div");
    recommendedVideoCard.className = "sug-video-card";

    recommendedVideoCard.innerHTML = `
    <img class="sug-vid-img" src="${
      ele.snippet.thumbnails.high.url
    }" alt="thumbnail-image">
    <div class="sub-vid-details">
        <div class="sug-vid-title">${ele.snippet.title}</div>
        <div class="sug-vid-channel-name">${ele.snippet.channelTitle}</div>
        <div class="sug-vid-data">${calculateViews(
          ele.viewObject[0].statistics.viewCount
        )} views , ${displayDuration} ago</div>
    </div>
    `;

    recommendedSectionDiv.appendChild(recommendedVideoCard);
  }
}

const channelPart = document.getElementById("channel-details");
channelPart.addEventListener("click", () => {
  window.location.href = "../html/channel.html";
});
