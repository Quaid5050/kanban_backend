const express = require("express");
const router = express.Router();
const User = require("../models/UserSchema");
const Project = require("../models/FormSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../Middleware/authenticate");
const form = require("../models/FormSchema");
const axios = require("axios").default;
const fetch = require("node-fetch");
const Address = require("../models/BoardSchema");
const Board = require("../models/BoardSchema");

const Card = require("../models/CardSchema");
const Task = require("../models/TaskSchema");
router.get("/", (req, res) => {
  res.send("Hello from home page");
});


// Register

router.post("/registeration", async (req, res) => {
  const { firstname, lastname, email, phone, password } = req.body;

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(422).json({
        stat: "wrong",
        error: "Email already exist",
      });
    }

    const user = new User({ firstname, lastname, email, phone, password });

    //   hashing

    await user.save();
    console.log("succcess");
    return res.status(201).json({
      stat: "success",
      message: "user registered successfully",
    });

  } catch (error) {
    console.log("fail");
    return res.status(500).json({
      stat: "wrong",
      error: error,
    });
  }
});

// Login

router.post("/login", async (req, res) => {

  const { email, password } = req.body;
  try {
    const userLogin = await User.findOne({ email: email });

    if (!userLogin) {
      return res.status(400).json({
        stat: "wrong",
        error: "invalid Creditenal",
      });
    } else {
      const isMatch = await bcrypt.compare(password, userLogin.password);
      if (isMatch) {
        const token = await userLogin.generateAuthToken();
        res.cookie("jwttoken", token, {
          httpOnly: true,
          // domain: process.env.CLIENT_DOMAIN
        });

        return res.status(200).json({
          stat: "success",
          message: "Successfully login",
        });
      } else {
        return res
          .status(400)
          .json({ stat: "wrong", error: "invalid Creditenal" });
      }
    }
  } catch (err) {
    console.log("In this block:" + err);
  }
});




router.get("/getemployeedata/:id", async (req, res) => {

  const { id } = req.params;
  try {
    const user = await User.findOne({ email: id });
    res.send({ stat: "success", user: user })
  }
  catch (err) {
    console.log("In this block:" + err);
  }
});







// about

router.get("/authenticate", authenticate, (req, res) => {

  res.send({ stat: "success", user: req.RUser });
});

router.post("/verifymember", authenticate, async (req, res) => {
  try {
    let data = req.body;
    let verify = await User.findOne({ email: data.member });

    if (verify) {
      res.send({ stat: "success" });
      return;
    }
  }
  catch (err) {
  }
  res.send({ stat: "fail" });

});


router.post("/addmember", authenticate, async (req, res) => {
  try {
    let { id, member } = req.body;

    let verify = await User.findOne({ email: member });
    if (!verify) {
      res.send({ stat: "fail" });
      return;
    }
    console.log("🚀 ~ file: router.js:138 ~ router.post ~ id:", id)
    console.log("🚀 ~ file: router.js:138 ~ router.post ~ member:", member)
    await Project.findById(id, (err, user) => {
      if (err) {
        res.send({ stat: "fail" });
        return;
      }
      user.teamMembers.push(member); // Add newFavorite to the favorites array
      user.save((err) => {
        if (err) {
          res.send({ stat: "success" });
          return;
        }
      });
    });
    res.send({ stat: "success" });
    return;

  }
  catch (err) {
  }
  res.send({ stat: "fail" });

});


router.post("/createproject", authenticate, async (req, res) => {
  try {
    let { title, description, teamMembers } = req.body;

    const project = new Project({ title, description, teamMembers, email: req.RUser.email });

    let verify = await project.save();

    if (verify) {
      console.log(verify);
      res.send({ stat: "success", project: verify });
      return;
    }
  }
  catch (err) {
  }
  res.send({ stat: "fail" });

});



router.get("/getprojects", authenticate, async (req, res) => {
  try {
    let projects = await Project.find({ email: req.RUser.email });
    console.log("🚀 ~ file: router.js:136 ~ router.get ~ req.RUser", req.RUser)

    res.send({ stat: "success", projects: projects });
    return;
  }
  catch (err) {
  }
  res.send({ stat: "fail" });
});



router.get("/gettasks", authenticate, async (req, res) => {
  try {
    let tasks = await Task.find({ assigned: req.RUser.email });

    res.send({ stat: "success", tasks: tasks });
    return;
  }
  catch (err) {
  }
  res.send({ stat: "fail" });
});




router.get("/logout", (req, res) => {

  res.cookie("jwttoken", "", {
    httpOnly: true,
  });

  return res.status(200).json({
    stat: "success",
  });
});


// board
router.post("/createboard", authenticate, async (req, res) => {
  try {
    let { title, id } = req.body;
    const project = await Project.findOne({ _id: id });

    if (!project) {
      res.send({ stat: "failed" });
    }

    const board = new Board({ title: title, projectid: id, projectCreation: project.created_at });
    let verify = await board.save();

    if (verify) {
      res.send({ stat: "success" });
      return;
    }
  }
  catch (err) {
    console.log(err)
  }
  res.send({ stat: "failed" });

});

router.get("/getboards/:id", authenticate, async (req, res) => {
  try {
    let { id } = req.params;
    let boards = await Board.find({ projectid: id });

    res.send({ stat: "success", boards: boards });
    return;
  }
  catch (err) {
  }
  res.send({ stat: "fail" });
});


router.get("/getprojectdata/:id", authenticate, async (req, res) => {
  try {
    let { id } = req.params;
    console.log("🚀 ~ file: router.js:221 ~ router.get ~ id:", id)
    let tasks;
    let project = await Project.findOne({ _id: id })

    let boards = await Board.find({ projectid: id }, { _id: 1 })
    if (boards.length > 0) {
      let cardsid = boards.map((data) => {
        return data._id
      })

      let cards = await Card.find({ boardid: cardsid }, { _id: 1 })

      if (cards.length > 0) {
        let tasksid = cards.map((data) => {
          return data._id
        })

        tasks = await Task.find({ cardid: tasksid })

      }

    }

    res.send({ stat: "success", tasks: tasks, project });
    console.log("🚀 ~ file: router.js:245 ~ router.get ~ tasks:", tasks)
    return;

  }
  catch (err) {
  }
  res.send({ stat: "fail" });
});


router.get("/getcards/:id", authenticate, async (req, res) => {
  try {
    let { id } = req.params;
    let cards = await Card.find({ boardid: id });

    res.send({ stat: "success", cards: cards });
    return;
  }
  catch (err) {
  }
  res.send({ stat: "fail" });
});


router.get("/gettasks/:id", authenticate, async (req, res) => {
  try {
    let { id } = req.params;
    let tasks = await Task.find({ cardid: id });

    res.send({ stat: "success", tasks: tasks });
    return;
  }
  catch (err) {
  }
  res.send({ stat: "fail" });
});


router.post("/createcard", authenticate, async (req, res) => {
  try {
    let { id, title } = req.body;
    const board = await Board.findOne({ _id: id });

    if (!board) {
      res.send({ stat: "failed" });
    }
    const card = new Card({ title: title, boardid: id });
    let verify = await card.save();


    if (verify) {
      res.send({ stat: "success" });
      return;
    }
  }
  catch (err) {
    console.log(err)
  }
  res.send({ stat: "failed" });

});


router.get("/getteam/:id", authenticate, async (req, res) => {
  try {
    let { id } = req.params;
    console.log("Get ", id)
    let project = await Project.find({ _id: id });
    res.send({ stat: "success", project });
    return;
  }
  catch (err) {
  }
  res.send({ stat: "fail" });
});

router.get("/gettask/:id", authenticate, async (req, res) => {
  try {
    let { id } = req.params;

    let tasks = await Task.find({ cardid: id });
    res.send({ stat: "success", tasks });
    return;
  }
  catch (err) {
  }
  res.send({ stat: "fail" });
});


router.get("/getburntasks/:id", authenticate, async (req, res) => {
  try {
    let { id } = req.params;
    let tasks;
    let project = await Project.findOne({ _id: id })

    let boards = await Board.find({ projectid: id }, { _id: 1 })
    if (boards.length > 0) {
      let cardsid = boards.map((data) => {
        return data._id
      })

      let cards = await Card.find({ boardid: cardsid }, { _id: 1 })

      if (cards.length > 0) {
        let tasksid = cards.map((data) => {
          return data._id
        })

        tasks = await Task.find({ cardid: tasksid })


      }


    }

    res.send({ stat: "success", tasks: tasks, project });
    return;

  }
  catch (err) {
  }
  res.send({ stat: "fail" });
});


router.post("/deletecard", authenticate, async (req, res) => {
  try {
    let { id } = req.body;

    let cards = await Card.deleteOne({ _id: id });
    res.send({ stat: "success", boards: cards });
    return;
  }
  catch (err) {
  }
  res.send({ stat: "fail" });
});



router.post("/moveboard", authenticate, async (req, res) => {
  try {
    let { boardId, id, index } = req.body;
    let item = `card.${index}`;
    let temp = await Board.findOne({ _id: boardId });
    let tempCard = temp.card[index];

    let boards = await Board.update({ _id: boardId }, { $unset: { [item]: 1 } });

    let verify = await Board.update(
      { _id: id },
      { $push: { card: tempCard } }
    );

    res.send({ stat: "success" });
    return;
  }
  catch (err) {
  }
  res.send({ stat: "fail" });
});


router.post("/deleteboard", authenticate, async (req, res) => {
  try {
    let { id } = req.body;

    let boards = await Board.deleteOne({ _id: id });
    res.send({ stat: "success", boards: boards });
    return;
  }
  catch (err) {
  }
  res.send({ stat: "fail" });
}

);

router.post("/deletetask", authenticate, async (req, res) => {
  try {
    let { id } = req.body;

    let boards = await Task.deleteOne({ _id: id });
    res.send({ stat: "success", boards: boards });
    return;
  }
  catch (err) {
  }
  res.send({ stat: "fail" });
});

router.post("/createtask", authenticate, async (req, res) => {
  try {
    let { title,
      description,
      deadline,
      priority,
      dependency,
      assigned,
      id } = req.body;

    const card = await Card.findOne({ _id: id });

    if (!card) {
      res.send({ stat: "failed" });
    }
    const task = new Task({ title: title, cardid: id, description, deadline, priority, dependency, assigned, });
    let verify = await task.save();

    if (verify) {
      res.send({ stat: "success" });
      return;
    }

  }
  catch (err) {
    console.log(err)
  }
  res.send({ stat: "failed" });

});

router.post("/updatetask", authenticate, async (req, res) => {
  try {
    let { title,
      description,
      deadline,
      priority,
      dependency,
      assigned,
      id } = req.body;


    let response = await Task.updateOne({ _id: id }, { $set: { title: title, description, deadline, priority, dependency, assigned } });
    console.log("🚀 ~ file: router.js:374 ~ router.post ~ res:", response)
    res.send({ stat: "success" });
    return;

  }
  catch (err) {
    console.log(err)
  }
  res.send({ stat: "failed" });

});

router.post("/updatetaskuser", async (req, res) => {
  try {
    let {
      priority,
      id } = req.body;
    console.log("🚀 ~ file: router.js:460 ~ router.post ~ priority:", priority)
    console.log("🚀 ~ file: router.js:460 ~ router.post ~ id:", id)


    let response = await Task.updateOne({ _id: id }, { $set: { priority } });
    console.log("🚀 ~ file: router.js:374 ~ router.post ~ res:", response)
    res.send({ stat: "success" });
    return;

  }
  catch (err) {
    console.log(err)
  }
  res.send({ stat: "failed" });

});






router.post("/updatecard", authenticate, async (req, res) => {
  try {
    let { title,
      id } = req.body;


    let response = await Card.updateOne({ _id: id }, { $set: { title: title } });
    console.log("🚀 ~ file: router.js:374 ~ router.post ~ res:", response)
    res.send({ stat: "success" });
    return;

  }
  catch (err) {
    console.log(err)
  }
  res.send({ stat: "failed" });

});

router.post("/updateboard", authenticate, async (req, res) => {
  try {
    let { title,
      id } = req.body;

    let response = await Board.updateOne({ _id: id }, { $set: { title: title } });
    console.log("🚀 ~ file: router.js:374 ~ router.post ~ res:", response)
    res.send({ stat: "success" });
    return;

  }
  catch (err) {
    console.log(err)
  }
  res.send({ stat: "failed" });

});

module.exports = router;
