class Post {

	constructor(content, time, likeCount, likes, id) {
		this.content = content;
		this.time = new Date(time);
		this.likeCount = likeCount;
		this.likes = likes
		this.id = id;

		this.currVote = this.getVote(getUserId())

	}

	getLikesUrl() {
		return 'http://localhost:3000/likes'
	}

	render() {
		let li = document.createElement("li");
		let p = document.createElement("p");
		let span = document.createElement("span")
		let button = document.createElement("button")

		p.innerHTML = this.content;
		button.innerHTML = "Comment";
		span.innerHTML = this.time.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });


		li.className = "list-group-item";
		button.className = "btn btn-warning";
		span.className = "sub-text";

		button.addEventListener('click', showCommentForm)

		let voteDiv = this.renderVoting()

		li.appendChild(p);
		li.appendChild(span)
		li.appendChild(voteDiv)
		li.appendChild(button);
		return li;
	}

	createVote(userId, upvote) {

		if (this.currVote.vote === null) {
			console.log('create')
			fetch(this.getLikesUrl(), {
				method: 'post',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({
					like: {
						user_id: userId,
						post_id: this.id,
						upvote: upvote
					}
				})
			}).then(resp => this.renderVote(upvote ? 1 : -1))
			this.currVote.vote = upvote
		} else if (this.currVote.vote === !upvote) {
			console.log('put')
			fetch('http://localhost:3000/likes/' + this.currVote.id, {
				body: JSON.stringify({ id: this.currVote.id }),
				method: 'put',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			}).then(resp => this.renderVote(upvote ? 2 : -2))
			this.currVote.vote = upvote
		} else {
			console.log('delete')
			fetch('http://localhost:3000/likes/' + this.currVote.id, {
				method: 'delete'
			}).then(resp => this.renderVote(upvote ? -1 : 1))
			this.currVote.vote = null;

		}
	}

	renderVote(diff) {
		let voteLabel = document.querySelector('#likes-' + this.id)
		voteLabel.innerText = parseInt(voteLabel.innerText) + diff
	}
	//returns true for upvote, false for downvote and null for no vote
	getVote(userId) {
		let res = {
			vote: null,
			likeId: null
		}

		this.likes.forEach(like => {
			if (like.user_id === userId) {
				res.vote = like.upvote
				res.id = like.id
			}
		})
		return res
	}

	renderVoting() {
		let voteDiv = document.createElement("div")

		let upVoteBtn = document.createElement("img");
		upVoteBtn.src = "img/upVote.png";
		upVoteBtn.addEventListener('click', e => this.createVote(getUserId(), true));

		let downVoteBtn = document.createElement("img");
		downVoteBtn.src = "img/downVote.png";
		downVoteBtn.addEventListener('click', e => this.createVote(getUserId(), false));

		let likeLabel = document.createElement("label");
		likeLabel.innerHTML = `${this.likeCount}`;
		likeLabel.id = 'likes-' + this.id

		voteDiv.appendChild(upVoteBtn)
		voteDiv.appendChild(likeLabel)
		voteDiv.appendChild(downVoteBtn)

		return voteDiv

	}

	static renderPosts(posts) {
		let container = document.getElementById("post-container");
		posts.forEach(post => {
			let newPost = new Post(post.content, post.created_at, post.like_count, post.likes, post.id)
			container.appendChild(newPost.render());
		})
	}

	static addPost(event) {
		let content = event.currentTarget.parentElement.children.postcontent.value;
		let location = [];
		navigator.geolocation.getCurrentPosition(p => {
			location = [p.coords.latitude, p.coords.longitude]
			fetch(GET_POSTS_URL, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({content: content, location: {x: location[0], y: location[1]}})
			})
			.then(res => res.json())
			.then(json => {
				let newPost = new Post(json.content, json.created_at, json.like_count, [], json.id)
				let container = document.getElementById("post-container")
				container.appendChild(newPost.render());
				console.log("Saved in DB");
		});
		})
	}

}
