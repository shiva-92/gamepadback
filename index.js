const express = require("express");
const mongoose = require("mongoose");
const formidableMiddleware = require("express-formidable");
const axios = require("axios");

const app = express();
app.use(formidableMiddleware());
const cors = require("cors");
app.use(cors());

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI);

const favori = mongoose.model("favori", {
  visuelgame: String,
  name: String,
  valtoken: String,
});

const utilisateur = mongoose.model("utilisateur", {
  username: String,
  email: String,
  token: String,
  hash: String,
  salt: String,
});

const review = mongoose.model("review", {
  titrereview: String,
  textereview: String,
  tokenreview: String,
  idcheck: String,
});

app.post("/create", async (req, res) => {
  console.log("ok");
  const salt = uid2(16);
  const hash = SHA256(req.fields.password + salt).toString(encBase64);
  const tokenversion = uid2(16);

  const newutilisateur = new utilisateur({
    username: req.fields.username,
    email: req.fields.email,
    token: tokenversion,
    hash: hash,
    salt: salt,
  });

  await newutilisateur.save();
  res.json(newutilisateur);
  console.log(salt);
});

app.post("/favori", async (req, res) => {
  try {
    const newfavori = new favori({
      visuelgame: req.fields.nomphoto,
      name: req.fields.nomgame,
      valtoken: req.fields.valeurtoken,
    });
    await newfavori.save();
    res.json(newfavori);
  } catch (e) {
    console.log(e.message);
  }
});

app.post("/recuperefavori", async (req, res) => {
  try {
    console.log(req.fields.tokencheck);
    const prefere = await favori.find({ valtoken: req.fields.tokencheck });
    console.log(prefere);
    res.json(prefere);
  } catch (e) {
    console.log(e.message);
  }
});

app.post("/sign", async (req, res) => {
  try {
    const tasks = await utilisateur.find({ username: req.fields.email });
    test = tasks[0].salt;
    console.log(test);
    check = SHA256(req.fields.password + test).toString(encBase64);
    console.log(check);
    console.log(tasks[0].hash);
    if (check === tasks[0].hash) {
      console.log("okacces");
      res.json({ token: tasks[0].token });
    } else {
      res.json("noid");
    }
  } catch (e) {
    console.log(e.message);
  }
});

app.post("/reviewpost", async (req, res) => {
  try {
    const newreview = new review({
      titrereview: req.fields.reviewtitle,
      textereview: req.fields.reviewtext,
      tokenreview: req.fields.tokentest,
      idcheck: req.fields.idnum,
    });
    await newreview.save();
    res.json(newreview);
    console.log(newreview);
  } catch (e) {
    console.log(e.message);
  }
});

app.post("/recuperecommentaire", async (req, res) => {
  try {
    const commentaire = await review.find({ idcheck: req.fields.testid });
    console.log(commentaire);
    res.json(commentaire);
  } catch (e) {
    console.log(e.message);
  }
});

//GAMES
app.get("/games", async (req, res) => {
  const game = req.query.game;
  const choix = req.query.choix;
  const idgame = req.query.idgame;
  const gametype = req.query.gametype;
  const check = req.query.check;

  let endpoint =
    "https://api.rawg.io/api/games?key=1804fba238364ea59c70ba67e4ba4d18";

  if (game) {
    endpoint = endpoint + `&` + `search=` + game;
  }

  if (choix) {
    endpoint = endpoint + `&` + `ordering=` + choix;
  }

  if (idgame) {
    endpoint = endpoint + `&` + `platforms=` + idgame;
  }

  if (gametype) {
    endpoint = endpoint + `&` + `genres=` + gametype;
  }

  if (check) {
    endpoint = endpoint + `&` + `page=` + check;
  }

  const response = await axios.get(endpoint);

  res.json(response.data);
  console.log(response.data);
});

//GENRES
app.get("/genres", async (req, res) => {
  const response = await axios.get(
    `https://api.rawg.io/api/genres?key=1804fba238364ea59c70ba67e4ba4d18`
  );

  res.json(response.data); //ce que tu renvoies au front
});

//PLATFORMS
app.get("/platforms", async (req, res) => {
  const response = await axios.get(
    `https://api.rawg.io/api/platforms?key=1804fba238364ea59c70ba67e4ba4d18`
  );

  res.json(response.data); //ce que tu renvoies au front
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});

//ID
app.get("/keygame", async (req, res) => {
  const id = req.query.id;

  const response = await axios.get(
    `https://api.rawg.io/api/games/${id}?key=1804fba238364ea59c70ba67e4ba4d18`
  );

  res.json(response.data); //ce que tu renvoies au front
});
