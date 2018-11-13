class Post {

	constructor(content, time, likes, id) {
		this.content = content;
		this.time = new Date(time);
		this.likes = likes;
		this.id = id;
	}

	render() {
		let li = document.createElement("li");
		let p = document.createElement("p");
		let imgUpVote = document.createElement("img");
		let imgDownVote = document.createElement("img");
		let p2 = document.createElement("p");
		let span = document.createElement("span")
		let button = document.createElement("button")

		p.innerHTML = this.content;
		p2.innerHTML = `Likes: ${this.likes}`;
		button.innerHTML = "Comment";
		span.innerHTML = this.time.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });


		li.className = "list-group-item";
		button.className = "btn btn-warning";
		span.className = "sub-text";
		imgUpVote.src = "img/upVote.png";
		imgDownVote.src = "img/downVote.png";

		imgUpVote.addEventListener('click', e => this.createLike(getUser(), this.id, true));
		imgDownVote.addEventListener('click', e => this.createLike(getUser(), this.id, false));
		button.addEventListener('click', showCommentForm)

		li.appendChild(p);
		li.appendChild(span)
		li.innerHTML += `<br>Likes: ${this.likes}    `;
		li.appendChild(imgUpVote);
		li.appendChild(imgDownVote);
		li.appendChild(button);
		return li;
	}

	createLike(userId, postId, upvote) {
		console.log(getUser(), this.id, upvote)

	}

	static renderPosts(posts) {
		let container = document.getElementById("post-container");
		posts.forEach(post => {
			let newPost = new Post(post.content, post.created_at, post.like_count, post.id)
			container.appendChild(newPost.render());
		})
	}


}