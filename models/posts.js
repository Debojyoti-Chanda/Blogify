const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  username: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  comments: [{
    commentText: String,
    commentuser: String,
    createdAt: { type: Date, default: Date.now }
  }]
  
});

// Method to add a comment to the post
postSchema.methods.postComment = async function(commentText,commentuser, createdAt) {
  this.comments.push({ commentText,commentuser,createdAt});
  return this.save();
};

// Method to delete a comment from a post
postSchema.methods.deleteComment = async function(commentId) {
  // Find the index of the comment in the comments array
  const index = this.comments.findIndex(comment => comment._id.equals(commentId));
  if (index !== -1) {
    // Remove the comment from the array
    this.comments.splice(index, 1);
    // Save the post
    return this.save();
  }
};




module.exports = mongoose.model('posts', postSchema);