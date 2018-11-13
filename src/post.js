class Post {

	constructor(content, time, likes, id){
		this.content = content;
		this.time = time;
		this.likes = likes;
		this.id = id;
	}

	render() {
		let li = document.createElement("li");
		let p = document.createElement("p");
		let imgUpVote = document.createElement("img");
		let imgDownVote = document.createElement("img");
		let p2 = document.createElement("p");

		p.innerHTML = this.content;
		p2.innerHTML = `Likes: ${this.likes}`;

		imgUpVote.src = "img/upVote.png";
		imgDownVote.src = "img/downVote.png";
		imgUpVote.addEventListener('click', e => this.createLike(getUser(), this.id, true));
		imgDownVote.addEventListener('click', e => this.createLike(getUser(), this.id, false));

		li.appendChild(p);
		li.appendChild(p2);
		li.appendChild(imgUpVote);
		li.appendChild(imgDownVote);
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
