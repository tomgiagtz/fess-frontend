class Post {

	constructor(content, time, likeCount, likes, id) {
		this.content = content;
		this.time = new Date(time);
		this.likeCount = likeCount;
		this.likes = likes
		this.id = id;
		this.currVote = this.getVote(getUserId())
	}

	setVoteImg(voteDiv) {
		if (this.currVote.vote === null) {return}
		this.currVote.vote ? this.toggleUpVote(voteDiv) : this.toggleDownVote(voteDiv)
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
		
		let voteDiv = this.renderVotes()
		this.setVoteImg(voteDiv)
		li.appendChild(p);
		li.appendChild(span)
		li.appendChild(voteDiv)
		li.appendChild(button);

		return li;
	}

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

	deleteVote(voteType) {
		console.log('delete')
		fetch('http://localhost:3000/likes/' + this.currVote.id, {
				method: 'delete'
			})
			.then(resp => resp.json())
			.then(json => {
				console.log(json)
				this.renderVote(this.currVote.vote, voteType)
				this.currVote.vote = null;
			})
	}

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
				console.log(json)
				this.renderVote(this.currVote.vote, voteType)
				this.currVote.vote = voteType
			})
	}

	newVote(userId, voteType) {
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
						upvote: voteType
					}
				})
			})
			.then(resp => resp.json())
			.then(json => {
				this.currVote.id = json.id
				this.renderVote(this.currVote.vote, voteType)
				this.currVote.vote = voteType
			})
	}

	renderVote(currVote, newVote) {
		let diff = 0;
		switch (currVote) {
			case null:
				if (newVote) {
					diff = 1
				} else {
					diff = -1
				}
				break
			case newVote:
				if (newVote) {
					diff = -1
				} else {
					diff = 1
				}
				break
			case !newVote:
				
				if (newVote) {
					diff = 2
				} else {
					diff = -2
				}
				break

		}

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

	toggleUpVote(voteDiv=document) {
		let vote = voteDiv.querySelector('#up-vote-' + this.id)
		this.toggleVoteImg(vote)
	}

	toggleDownVote(voteDiv=document) {
		let vote = voteDiv.querySelector('#down-vote-' + this.id)
		this.toggleVoteImg(vote)
	}

	toggleVoteImg(vote) {
		if (vote.src.endsWith('outline.svg')) {
			vote.src = vote.src.replace('outline', 'fill')
		} else {
			vote.src = vote.src.replace('fill', 'outline')
		}
	}

}