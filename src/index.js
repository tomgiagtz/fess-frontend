document.addEventListener('DOMContentLoaded', () => {
	console.log("Connected");
	navigator.geolocation.getCurrentPosition(p => {
		getPostsByLocation(p);
		LOCATION = p;
	});
	createUser();
	document.getElementById("add-post-button").addEventListener("click", Post.addPost)
	document.getElementById("add-comment").addEventListener("click", Post.createComment)
	document.querySelector(".nearest").addEventListener("click", e => getPostsByLocation(LOCATION))
	document.querySelector(".recent").addEventListener("click", e => getRecentPosts(LOCATION))
});

//URLS we will need for getting and posting

function headers() { return { 'Content-Type': 'application/json', 'Accept': 'application/json' } }

function postURL() { return "https://fess-backend.herokuapp.com/posts" }

function likeURL() { return "https://fess-backend.herokuapp.com/likes" }

function userURL() { return "https://fess-backend.herokuapp.com/users" }

function commentURL() { return "https://fess-backend.herokuapp.com/comments" }



//Getting posts by location
function getPosts(location) {
	if (location) {
		LOCATION(getPostsByLocation)
	} else {
		fetch(postURL(), {
				headers: {
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
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
	fetch(postURL(), {
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
			Post.renderPosts(json, container)
		})
};

function getRecentPosts(location) {
	console.log('another fetch')
	fetch(postURL(), {
			headers: {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				location: "true"
			}
		})
		.then(res => res.json())
		.then(json => {
			let container = document.getElementById("recent-container")
			Post.renderPosts(json, container)
		})

}




function getUserId() {
	return parseInt(document.cookie.split('=')[1])
}

function createUser() {
	if (!getUserId()) {
		fetch(userURL())
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
	let p = document.createElement('p');
	let span = document.createElement('span');
	let time = new Date(comment.created_at);

	p.innerHTML = comment.content;
	span.innerHTML = time.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " " + time.toLocaleTimeString('en-US');

	p.className = "comment-text"
	li.className = "list-group-item"
	span.className = "sub-text";

	li.appendChild(p);
	li.appendChild(span);
	ul.appendChild(li);
}
