class Post {

  constructor(content, time, likes){
    this.content = content;
    this.time = time;
    this.likes = likes;
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
    imgUpVote.addEventListener('click', upVote);
    imgDownVote.addEventListener('click', downVote);

    li.appendChild(p);
    li.appendChild(p2);
    li.appendChild(imgUpVote);
    li.appendChild(imgDownVote);
    return li;
  }

  static renderPosts(posts) {
    let container = document.getElementById("post-container");
    posts.forEach(post => {
      let newPost = new Post(post.content, post.created_at, post.like_count)
      container.appendChild(newPost.render());
    })
  }

}
