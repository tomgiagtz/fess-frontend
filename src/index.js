document.addEventListener('DOMContentLoaded', () => {
  console.log("Connected");
  getPosts();
  createUser();
});

//URLS we will need for getting and posting
const GET_POSTS_URL = "http://localhost:3000/posts"
const USER_CREATE = "http://localhost:3000/users"


//Getting posts by location
function getPosts() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getPostsByLocation);
  } else {
    fetch(GET_POSTS_URL, {
      headers: {
        location: "false"
      }
    })
    .then(res => res.json())
    .then(json => {
      console.log("Got post without location");
    });
    console.log("Geolocation is not supported by this browser.");
  }
};

function getPostsByLocation(location) {
  fetch(GET_POSTS_URL, {
    headers: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      location: "true"
      }
    })
  .then(res => res.json())
  .then(Post.renderPosts)
};

function upVote(event) {
  console.log("UpVoted Button");
}

function downVote(event) {
  console.log("DownVoted button");
}

function createUser() {
  fetch(USER_CREATE)
  .then(res => res.json())
  .then(json => {
    document.cookie = `user=${json.id}`
  })
}

function showCommentForm() {
console.log("showCommentForm button");
}
