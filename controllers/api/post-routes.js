const router = require("express").Router();
const { Post, User, Vote } = require("../../models");
const sequelize = require('../../config/connection');

//Get all posts
router.get("/", (req, res) => {
  Post.findAll({
    attributes: [
      "id", 
      "title", 
      "content", 
      "user_id",
      [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
    ],
    order: [["created_at", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["first_name", "last_name"],
      },
    ],
  })
    .then((dbPostData) => res.json(dbPostData))
    .catch((err) => {
      res.status(500).json(err);
    });
});

//Get Post by ID
router.get("/:id", (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id,
    },
    attributes: [
      "id", 
      "title", 
      "content", 
      "user_id",
      [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
    ],
    include: [
      {
        model: User,
        attributes: ["first_name", "last_name"],
      },
    ],
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

//Create a new Post
router.post("/", (req, res) => {
  Post.create({
    title: req.body.title,
    content: req.body.content,
    user_id: req.body.user_id,
  })
    .then((dbPostData) => res.json(dbPostData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

//UPVOTE a Post
router.put("/upvote", (req,res) => { //res, req
  // custom static method created in models/Post.js
  Post.upvote(req.body, {Vote})
  .then(dbPostData => {
    res.json(dbPostData);
  })
  .catch(err => {
    res.status(400).json(err);
  });
});

//Update a Post
router.put("/:id", (req, res) => {
  Post.update(
    {
      //title and post content can be changed
      title: req.body.title,
      content: req.body.content,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

//Delete a Post
router.delete("/:id", (req, res) => {
  Post.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
