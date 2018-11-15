let allPosts = [];

class Post {

	constructor(content, time, likeCount, likes, id, comments = []) {
		this.content = content;
		this.time = new Date(time);
		this.likeCount = likeCount;
		this.likes = likes
		this.id = id;
		this.currVote = this.getVote(getUserId());
		this.comments = comments;
		allPosts.push(this);

	}

	//returns like url
	getLikesUrl() {
		return 'http://localhost:3000/likes'
	}

	//renders a post
	render() {
		let li = document.createElement("li");
		let p = document.createElement("p");
		let span = document.createElement("span")
		let button = document.createElement("button")

		p.innerHTML = this.content;
		button.innerHTML = "Comment";
		button.dataset.post = `${this.id}`;
		span.innerHTML = this.time.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });


		li.className = "list-group-item";
		button.className = "btn btn-warning";
		span.className = "sub-text";

		button.addEventListener('click', showModal)

		let voteDiv = this.renderVotes()
		this.setVoteImg(voteDiv)

		li.appendChild(p);
		li.appendChild(span)
		li.appendChild(voteDiv)
		li.appendChild(button);

		return li;
	}
	//handles logic for a vote event, making the correct database call and rendering the new vote
	vote(userId, voteType) {
		voteType ? this.toggleUpVote() : this.toggleDownVote()
		if (this.currVote.vote === null) {
			this.newVote(userId, voteType)

		} else if (this.currVote.vote === !voteType) {
			this.updateVote(voteType)
			!voteType ? this.toggleUpVote() : this.toggleDownVote()

		} else {
			this.deleteVote(voteType)
		}
	}
	//deletes a vote
	deleteVote(voteType) {
		console.log('delete')
		fetch('http://localhost:3000/likes/' + this.currVote.id, {
				method: 'delete'
			})
			.then(resp => resp.json())
			.then(json => {
				// console.log(json)
			})
		this.renderVote(voteType)
		this.currVote.vote = null;
	}
	//executes put for changing a vote
	updateVote(voteType) {
		console.log('put')
		fetch('http://localhost:3000/likes/' + this.currVote.id, {
				body: JSON.stringify({ id: this.currVote.id }),
				method: 'put',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			})
			.then(resp => resp.json())
			.then(json => {
				// console.log(json)
			})
		this.renderVote(voteType)
		this.currVote.vote = voteType
	}
	// executes POST for new vote
	newVote(userId, voteType) {
		console.log('create')
		fetch(this.getLikesUrl(), {
				method: 'post',
				headers: HEADERS,
				body: JSON.stringify({
					like: {
						user_id: userId,
						post_id: this.id,
						upvote: voteType
					}
				})
			})
			.then(resp => resp.json())
			.then(json => {this.currVote.id = json.id})
		this.renderVote(voteType)
		this.currVote.vote = voteType
	}


	//takes the current vote and new vote
	renderVote(newVote) {
		let diff = 0;
		switch (this.currVote.vote) {
			case null:
				newVote ? diff = 1 : diff = -1
				break
			case newVote:
				newVote ? diff = -1 : diff = 1
				break
			case !newVote:

				newVote ? diff = 2 : diff = -2
				break
		}

		let voteLabel = document.querySelector('#likes-' + this.id)
		voteLabel.innerText = parseInt(voteLabel.innerText) + diff

	}

	static createComment(event) {
		let content = event.currentTarget.parentElement.parentElement.children["comment-input"].value;
		// Need to add
		let userId = document.cookie.split('=')[1];
		let post = Post.findByPostId(parseInt(event.currentTarget.dataset.post))[0];
		post.postComment(content, userId);
	}


	postComment(content, userId) {
		fetch(COMMENTS_URL, {
			method: "POST",
			headers: HEADERS,
			body: JSON.stringify({
				comment: {
					user_id: userId,
					post_id: this.id,
					content: content
				}
			})
		}).then(res => res.json())
		.then(json => {
			this.comments.push(json);
			renderComment(json, this);
			console.log(json);
		})
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

	//renders voting section of post

	renderVotes() {
		let voteDiv = document.createElement("div")

		let upVoteBtn = document.createElement("img");
		upVoteBtn.id = 'up-vote-' + this.id
		upVoteBtn.src = "img/arrow-up-outline.svg";
		upVoteBtn.addEventListener('click', e => this.vote(getUserId(), true));

		let downVoteBtn = document.createElement("img");
		downVoteBtn.id = 'down-vote-' + this.id
		downVoteBtn.src = "img/arrow-down-outline.svg";
		downVoteBtn.addEventListener('click', e => this.vote(getUserId(), false));

		let likeLabel = document.createElement("label");
		likeLabel.innerHTML = `${this.likeCount}`;
		likeLabel.id = 'likes-' + this.id

		voteDiv.appendChild(upVoteBtn)
		voteDiv.appendChild(likeLabel)
		voteDiv.appendChild(downVoteBtn)

		return voteDiv
	}

	//renders all posts

	static renderPosts(posts) {
		let container = document.getElementById("post-container");
		posts.forEach(post => {
			let newPost = new Post(post.content, post.created_at, post.like_count, post.likes, post.id, post.comments)
			container.appendChild(newPost.render());
		})
	}

	//POSTs a post to databse

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
					body: JSON.stringify({ content: content, location: { x: location[0], y: location[1] } })
				})
				.then(res => res.json())
				.then(json => {
					let newPost = new Post(json.content, json.created_at, json.like_count, [], json.id)
					let container = document.getElementById("post-container")
					container.appendChild(newPost.render());
					console.log("Saved in DB");
					document.getElementById('postcontent').value = ''
				});
		})
	}


	static findByPostId(id) {
		return allPosts.filter(post => {
			return post.id === id;
		})
	}
	//sets imgs on render of post

	setVoteImg(voteDiv) {
		if (this.currVote.vote === null) { return }
		this.currVote.vote ? this.toggleUpVote(voteDiv) : this.toggleDownVote(voteDiv)
	}
	// toggle Up and toggle Down select the vote img for respective buttons

	toggleUpVote(voteDiv = document) {
		let voteImg = voteDiv.querySelector('#up-vote-' + this.id)
		this.toggleVoteImg(voteImg)
	}

	toggleDownVote(voteDiv = document) {
		let voteImg = voteDiv.querySelector('#down-vote-' + this.id)
		this.toggleVoteImg(voteImg)
	}
	//takes a voteImg and toggles it between filled and not
	toggleVoteImg(voteImg) {
		if (voteImg.src.endsWith('outline.svg')) {
			voteImg.src = voteImg.src.replace('outline', 'fill')
		} else {
			voteImg.src = voteImg.src.replace('fill', 'outline')
		}
	}

}
