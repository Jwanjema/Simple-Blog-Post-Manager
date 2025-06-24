// The main function that runs when the page loads
document.addEventListener('DOMContentLoaded', function() {
  loadPosts();
  setupEventListeners();
});

// This is for loading & displaying posts
function loadPosts() {
  fetch('http://localhost:3000/posts')
    .then(response => response.json())
    .then(posts => {
      displayPosts(posts);
      if (posts.length > 0) {
        showPostDetails(posts[0].id);
      }
    })
    .catch(error => {
      console.log('Error:', error);
      showError('Could not load posts');
    });
}

// This function displays all posts in the list and sets up click events
function displayPosts(posts) {
  const postList = document.getElementById('post-list');
  postList.innerHTML = '<h2>All Posts</h2>';
  
  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post-item';
    postElement.innerHTML = `
      <h3>${post.title}</h3>
      <p>By ${post.author}</p>
    `;
    postElement.addEventListener('click', () => showPostDetails(post.id));
    postList.appendChild(postElement);
  });
}

// Show details for one post
function showPostDetails(postId) {
  fetch(`http://localhost:3000/posts/${postId}`)
    .then(response => response.json())
    .then(post => {
      const postDetail = document.getElementById('post-detail');
      postDetail.innerHTML = `
        <h2>${post.title}</h2>
        <p><em>By ${post.author} on ${post.date}</em></p>
        <p>${post.content}</p>
        <div class="buttons">
          <button id="edit-btn">Edit</button>
          <button id="delete-btn">Delete</button>
        </div>
      `;
      
      // Add event listeners to the new buttons
      document.getElementById('edit-btn').addEventListener('click', () => editPost(post.id));
      document.getElementById('delete-btn').addEventListener('click', () => deletePost(post.id));
    })
    .catch(error => {
      console.log('Error:', error);
      showError('Could not load post');
    });
}

// Set up event listeners for the form submission
function setupEventListeners() {
  document.getElementById('submit-btn').addEventListener('click', addNewPost);
}

// this function adds a new post
function addNewPost(event) {
  event.preventDefault();
  
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const author = document.getElementById('author').value;
  
  if (!title || !content || !author) {
    showError('Please fill all fields');
    return;
  }

  fetch('http://localhost:3000/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title,
      content: content,
      author: author,
      date: new Date().toISOString().split('T')[0]
    })
  })
  .then(response => {
    if (!response.ok) throw new Error('Failed to add post');
    return response.json();
  })
  .then(() => {
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('author').value = '';
    document.getElementById('error-message').textContent = '';
    loadPosts();
  })
  .catch(error => {
    console.log('Error:', error);
    showError('Could not add post');
  });
}

// This function edits an existing post
function editPost(postId) {
  fetch(`http://localhost:3000/posts/${postId}`)
    .then(response => response.json())
    .then(post => {
      const newTitle = prompt('Edit title:', post.title);
      const newContent = prompt('Edit content:', post.content);
      
      if (newTitle && newContent) {
        return fetch(`http://localhost:3000/posts/${postId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newTitle,
            content: newContent
          })
        });
      }
    })
    .then(response => {
      if (response && response.ok) {
        loadPosts();
      }
    })
    .catch(error => {
      console.log('Error:', error);
      showError('Could not edit post');
    });
}

// This function deletes a post
function deletePost(postId) {
  if (confirm('Are you sure you want to delete this post?')) {
    fetch(`http://localhost:3000/posts/${postId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to delete');
      loadPosts();
      document.getElementById('post-detail').innerHTML = '<p>Post deleted. Select another post.</p>';
    })
    .catch(error => {
      console.log('Error:', error);
      showError('Could not delete post');
    });
  }
}

// This function shows an error message for a few seconds
function showError(message) {
  const errorElement = document.getElementById('error-message');
  errorElement.textContent = message;
  setTimeout(() => {
    errorElement.textContent = '';
  }, 3000);
}