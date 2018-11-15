document.addEventListener('DOMContentLoaded', () => {
	console.log("Connected");
	createUser();
	getPosts();
	document.getElementById("add-post-button").addEventListener("click", Post.addPost)
	document.getElementById("add-comment").addEventListener("click", Post.createComment)
	document.querySelector(".nearest").addEventListener("click", e => LOCATION.getCurrentPosition(getPostsByLocation)) //
	document.querySelector(".recent").addEventListener("click", e => LOCATION.getCurrentPosition(getRecentPosts))
});

//URLS we will need for getting and posting
const GET_POSTS_URL = "http://localhost:3000/posts";
const USER_URL = "http://localhost:3000/users";
const COMMENTS_URL = "http://localhost:3000/comments"
const HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' }


//Getting posts by location
function getPosts() {
	if (navigator.geolocation) {
		LOCATION = navigator.geolocation
		LOCATION.getCurrentPosition(getPostsByLocation)
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
	console.log('another fetch')
	fetch(GET_POSTS_URL, {
			headers: {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				location: "true",
				nearest: "true"
			}
		})
		.then(res => res.json())
		.then(json => {
			let container = document.getElementById("nearest-container")
			// clearChildren(container)
			Post.renderPosts(json, container)
		})
};

function getRecentPosts(location) {
	console.log('another fetch')
	fetch(GET_POSTS_URL, {
			headers: {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				location: "true"
			}
		})
		.then(res => res.json())
		.then(json => {
			let container = document.getElementById("recent-container")
			// clearChildren(container)
			Post.renderPosts(json, container)
		})
};

// function clearChildren(node) {
// 	// let firstChild = node.firstChild
// 	// while (firstChild) {
// 	// 	node.remove(firstChild)
// 	// 	firstChild = node.firstChild
// 	// 	console.log('woop')
// 	// }
// 	node.innerHTML = ''
// }


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
	let addComment = document.getElementById("add-comment");
	let ul = document.getElementById("modal-ul");


	modalTitle.innerHTML = post.content
	ul.innerHTML = '';
	addComment.dataset.post = `${post.id}`;

	post.comments.forEach(comment => {
		renderComment(comment);
	})

	document.getElementById("modal-button").click();
}

function renderComment(comment) {
	let ul = document.getElementById("modal-ul");
	let li = document.createElement('li');
	li.className = "list-group-item"
	li.innerHTML = comment.content;
	ul.appendChild(li);
}