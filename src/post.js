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

	//renders a post
	render() {
		let li = document.createElement("li");
		let p = document.createElement("p");
		let span = document.createElement("span")
		let button = document.createElement("button")

		p.innerHTML = this.content;
		button.innerHTML = `Comments <span class="badge badge-primary badge-pill">${this.comments.length}</span>`;
		button.dataset.post = `${this.id}`;
		li.dataset.post = `${this.id}`;
		span.innerHTML = this.time.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " " + this.time.toLocaleTimeString('en-US');


		li.className = "list-group-item";
		button.className = "btn btn-primary btn-sm float-right";
		span.className = "sub-text";

		button.addEventListener('click', showModal)

		let voteDiv = this.renderVotes()
		this.setVoteImg(voteDiv)

		li.appendChild(p);
		li.appendChild(span)
		li.appendChild(voteDiv)
		voteDiv.appendChild(button);

		return li;
	}
	//handles logic for a vote event, making the correct database call and rendering the new vote
	vote(userId, voteType) {

		if (this.currVote.vote === null) {
			this.newVote(userId, voteType)

		} else if (this.currVote.vote === !voteType) {
			this.updateVote(voteType)

		} else {
			this.deleteVote(voteType)
		}
	}

	//deletes a vote
	deleteVote(voteType) {
		fetch(`${likeURL()}/${this.currVote.id}`, {
				method: 'delete'
			})
			.then(resp => resp.json())
			.then(json => {
				this.currVote.vote = null;
			})
		this.renderVote(voteType)

	}
	//executes put for changing a vote
	updateVote(voteType) {
		fetch(likeURL() + '/' + this.currVote.id, {
				body: JSON.stringify({ id: this.currVote.id }),
				method: 'put',
				headers: headers()
			})
			.then(resp => resp.json())
			.then(json => {
			})
		this.renderVote(voteType)
		this.currVote.vote = voteType
	}
	// executes POST for new vote
	newVote(userId, voteType) {
		fetch(likeURL(), {
				method: 'post',
				headers: headers(),
				body: JSON.stringify({
					like: {
						user_id: userId,
						post_id: this.id,
						upvote: voteType
					}
				})
			})
			.then(resp => resp.json())
			.then(json => { this.currVote.id = json.id })
		this.renderVote(voteType)
		this.currVote.vote = voteType
	}


	//takes the current vote and new vote
	renderVote(newVote) {
		let diff = 0;
		newVote ? this.toggleUpVote() : this.toggleDownVote()
		switch (this.currVote.vote) {
			case null:
				newVote ? diff = 1 : diff = -1
				break
			case newVote:
				newVote ? diff = -1 : diff = 1
				break
			case !newVote:
				!newVote ? this.toggleUpVote() : this.toggleDownVote()
				newVote ? diff = 2 : diff = -2
				break
		}


		let voteLabels = document.querySelectorAll('.likes-' + this.id)
		voteLabels.forEach(label => label.innerText = parseInt(label.innerText) + diff)

	}

	static createComment(event) {
		let content = event.currentTarget.parentElement.parentElement.children["comment-input"].value;
		let userId = document.cookie.split('=')[1];
		let post = Post.findByPostId(parseInt(event.currentTarget.dataset.post))[0];
		post.postComment(content, userId);
	}


	postComment(content, userId) {
		fetch(commentURL(), {
				method: "POST",
				headers: headers(),
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
				renderComment(json);
				document.getElementById("comment-input").value = "";
			}).catch(e => {
				window.alert("Your comment did not go through");
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
		upVoteBtn.className = 'up-vote-' + this.id
		upVoteBtn.src = "img/arrow-up-outline.svg";
		upVoteBtn.addEventListener('click', e => this.vote(getUserId(), true));

		let downVoteBtn = document.createElement("img");
		downVoteBtn.className = 'down-vote-' + this.id
		downVoteBtn.src = "img/arrow-down-outline.svg";
		downVoteBtn.addEventListener('click', e => this.vote(getUserId(), false));

		let likeLabel = document.createElement("label");
		likeLabel.innerHTML = `${this.likeCount}`;
		likeLabel.className = 'likes-' + this.id

		voteDiv.appendChild(upVoteBtn)
		voteDiv.appendChild(likeLabel)
		voteDiv.appendChild(downVoteBtn)

		return voteDiv
	}

	//renders all posts

	static renderPosts(posts, container) {
		container.innerHTML = ""
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
			fetch(postURL(), {
					method: "POST",
					headers: headers(),
					body: JSON.stringify({ content: content, location: { x: location[0], y: location[1] } })
				})
				.then(res => res.json())
				.then(json => {
					// let newPost = new Post(json.content, json.created_at, json.like_count, [], json.id)
					// let container = document.getElementById("post-container")
					// container.appendChild(newPost.render());
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
		let voteImgs = voteDiv.querySelectorAll('.up-vote-' + this.id)
		voteImgs.forEach(img => this.toggleVoteImg(img))
	}

	toggleDownVote(voteDiv = document) {
		let voteImgs = voteDiv.querySelectorAll('.down-vote-' + this.id)
		voteImgs.forEach(img => this.toggleVoteImg(img))
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