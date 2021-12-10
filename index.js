const express = require("express");
const mongoose = require("mongoose");
const formidableMiddleware = require("express-formidable");

const app = express();
app.use(formidableMiddleware());
const cors = require("cors");
app.use(cors());

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

//création bd "bdgamepad"
mongoose.connect("mongodb://localhost:27017/bdgamepad");

const favori = mongoose.model("favori", {
  visuelgame: String,
  name: String,
  valtoken: String,
});

//nom du tableau excel "utilisateur"
//tu enregistre identité dans la base = t'es membre = tu peux faire action
const utilisateur = mongoose.model("utilisateur", {
  username: String,
  email: String,
  //password tu l'enregistre via hash salt, bon mdp ca genere variable
  token: String,
  hash: String,
  salt: String,
  //avec hash et salt tu deduiras password
});

const review = mongoose.model("review", {
  titrereview: String,
  textereview: String,
  tokenreview: String,
  idcheck: String,
});

//au clic on décide d'executer interieur de fonction qui remplit ca et qui renvoi token
app.post("/create", async (req, res) => {
  console.log("ok");
  const salt = uid2(16); //stocké dans la base de donné
  const hash = SHA256(req.fields.password + salt).toString(encBase64); //hash=(mdp+salt) stocké dans la base de donnéé
  const tokenversion = uid2(16); //token chaine de caractere

  const newutilisateur = new utilisateur({
    username: req.fields.username, //au clic, tu remplis lignes avec req fields et tu met dans base de donné
    email: req.fields.email,
    token: tokenversion,
    hash: hash, //mdp+salt ce que l'admin voit tu dois le stocker pr l'utiliser plus tard
    salt: salt, //stocké dans la base de donné tu dois le stocker pr l'utiliser plus tard via la somme, tu sais que c'est le meme mdp
  });

  await newutilisateur.save(); //newutilisateur={objet} //ca save
  res.json(newutilisateur); //response objet enregistré dans la base de données ca renvoie au front la c'était postman apres front
  console.log(salt); //salt: DF9HTBSxSul-y_AW
});

app.post("/favori", async (req, res) => {
  //comparer hash(mdp donné + salt stocké) = hash
  try {
    const newfavori = new favori({
      //remplir champs
      visuelgame: req.fields.nomphoto,
      name: req.fields.nomgame,
      valtoken: req.fields.valeurtoken,
    }); //ca te redonne cet objet la
    await newfavori.save(); //une fois rempli tu sauvegarde l'occurence
    res.json(newfavori); //ca te renvoi objet ce qui a été enregistré dans base de donné
  } catch (e) {
    console.log(e.message);
  }
});

app.post("/recuperefavori", async (req, res) => {
  try {
    console.log(req.fields.tokencheck);
    //recupere tous ceux qui ont ce token
    const prefere = await favori.find({ valtoken: req.fields.tokencheck }); //tu recupere ds prefere toutes les occurence de favori {},{},{} prefere=variable  qui stock chaque objet l'un a la suite de l'autre encapsulé dans un tableau et tu le renvoi au front et tu map dessus
    //recuperer dans une variable tout les documents et tu renvoie au front, le response il  ca, tu map dessus
    console.log(prefere);
    res.json(prefere);
    // res.json("ok");
  } catch (e) {
    console.log(e.message);
  }
});

app.post("/sign", async (req, res) => {
  //comparer hash(mdp donné + salt stocké) = hash
  try {
    const tasks = await utilisateur.find({ username: req.fields.email }); //tu recupere document qui ont req.fields.username dans clé dans username tu prends dans la table utilisateur, tout ceux qui ont req.fields.username en username
    test = tasks[0].salt; //tasks[0]->tableau encapsulé dansobjet dans taskstu recupere document, tu prends salt, tu aditione salt et password, ca donne chaine de caractere
    console.log(test); //salt
    check = SHA256(req.fields.password + test).toString(encBase64); //check=hash(password+salt)
    console.log(check); //hash
    console.log(tasks[0].hash); //document recuperé, on voit hash
    if (check === tasks[0].hash) {
      console.log("okacces");
      res.json({ token: tasks[0].token }); //on te redonne le meme token
    } else {
      res.json("noid");
    }
  } catch (e) {
    console.log(e.message);
  }
});

app.post("/reviewpost", async (req, res) => {
  //comparer hash(mdp donné + salt stocké) = hash
  try {
    // console.log(req.fields.reviewtitle);
    // console.log(req.fields.reviewtext);
    const newreview = new review({
      //remplir champs
      titrereview: req.fields.reviewtitle,
      textereview: req.fields.reviewtext,
      tokenreview: req.fields.tokentest,
      idcheck: req.fields.idnum, //tu clips info et tu sauvegarde
    });
    await newreview.save(); //une fois rempli tu sauvegarde l'occurence
    res.json(newreview);
    console.log(newreview); //affiche objet qui a été enregistré dans base de données (clips) ca te renvoi objet qui a été enregistré dans base de donné
  } catch (e) {
    console.log(e.message);
  }
});

app.post("/recuperecommentaire", async (req, res) => {
  //comparer hash(mdp donné + salt stocké) = hash
  try {
    // console.log(req.fields.reviewtitle);
    // console.log(req.fields.reviewtext);
    //pr manipuler valeur tu utilise variable
    const commentaire = await review.find({ idcheck: req.fields.testid }); //recupere tout les documents de commentaire qui ont ce token
    //tu recupere ds prefere toutes les occurence de favori {},{},{} prefere=variable  qui stock chaque objet l'un a la suite de l'autre encapsulé dans un tableau et tu le renvoi au front et tu map dessus recupere tous les clips de review
    //recuperer dans une variable tout les documents et tu renvoie au front, le response il  ca, tu map dessus
    console.log(commentaire); //objet avec tout les commentaires dans commentaire
    //afficher tout ceux qui ont cet id
    res.json(commentaire);
  } catch (e) {
    console.log(e.message);
  }
});

app.listen(3000, () => {
  console.log("Server started");
});
