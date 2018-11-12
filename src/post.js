class Post {

  constructor(content, time, likes){
    this.content = content;
    this.time = time;
    // this.upVotes = this.upVote(likes);
    // this.downVotes = this.downVote(likes);
  }

  render() {
    let li = document.createElement("li");
    let p = document.createElement("p");
    let imgUpVote = document.createElement("img");
    let imgDownVote = document.createElement("img");

    p.innerHTML = this.content;


    imgUpVote.src = "img/upVote.png";
    imgDownVote.src = "img/downVote.png";
    imgUpVote.addEventListener('click', upVote);
    imgDownVote.addEventListener('click', downVote);

    li.appendChild(p);
    li.appendChild(imgUpVote);
    li.appendChild(imgDownVote);
    return li;
  }

  // upVote(likes) {
  //   let count = 0;
  //
  //   likes.forEach(like => {
  //     if (like["upvote"] === true) {
  //       count++;
  //     }
  //   })
  //   return count;
  // }
  //
  // downVote(likes) {
  //   let count = 0;
  //
  //   likes.forEach(like => {
  //     if (like["upvote"] === false) {
  //       count++;
  //     }
  //   })
  //   return count;
  // }

  static renderPosts(posts) {
    let container = document.getElementById("post-container");
    posts.forEach(post => {
      let newPost = new Post(post.content, post.created_at, post.likes)
      container.appendChild(newPost.render());
    })
  }

}
