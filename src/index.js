document.addEventListener('DOMContentLoaded', () => {
    console.log("Connected");
    createUser();
    getPosts();
    document.getElementById("add-post-button").addEventListener("click", Post.addPost)
    document.getElementById("add-comment").addEventListener("click", Post.createComment)
});

//URLS we will need for getting and posting
const GET_POSTS_URL = "http://localhost:3000/posts";
const USER_URL = "http://localhost:3000/users";
const COMMENTS_URL = "http://localhost:3000/comments"
const HEADERS = {'Content-Type': 'application/json','Accept': 'application/json'}


//Getting posts by location
function getPosts() {
    if (navigator.geolocation) {
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

function getUserId() {
    return parseInt(document.cookie.split('=')[1])
}

function createUser() {
    if (!getUserId()) {
        fetch(USER_URL)
            .then(res => res.json())
            .then(json => {
                document.cookie = `user=${json.id}`
            })
    }
}

function showModal(event) {
  post = Post.findByPostId(parseInt(event.currentTarget.dataset.post))[0];
  let modalTitle = document.getElementById("ModalTitle")
  let modalComments = document.getElementById("modal-comments");
  modalTitle.innerHTML = post.content
  modalComments.innerHTML = '';
  let ul = document.createElement("ul");
  ul.className = "list-group"
  post.comments.forEach(comment => {
    let li = document.createElement('li');
    li.className = "list-group-item"
    li.innerHTML = comment.content;
    ul.appendChild(li);
  })
  modalComments.appendChild(ul);
  document.getElementById("modal-button").click();
}

function renderComment(comment) {

}
