const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 8000;
const cors = require("cors");
const jwt = require("jsonwebtoken");

const JWTSecret = "x1a2t3c4i9o10";

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//middleware
const auth = (req,res, next) => {
     
    const authToken = req.headers['authorization'];
    
    if(authToken != undefined){

      const bearer = authToken.split(' ');
      let token = bearer[1];

      jwt.verify(token,JWTSecret,(err,data) => {
        if(err){
          res.status(401);
          res.json({err:"Token Invalido"})
        }else{
          req.token = token;
          req.loggedUser = {id: data.id, email: data.email};
          next();
        }
      });

    }else{
      res.status(401);
      res.json({err:"Token Invalido !!! "})
    }

    

}

let DB = {
  games: [
    {
      id: 23,
      title: "Call of duty MW",
      year: 2019,
      price: 60,
    },
    {
      id: 65,
      title: "Sea of thieves",
      year: 2018,
      price: 40,
    },
    {
      id: 2,
      title: "Minecraft",
      year: 2012,
      price: 5,
    },
  ],
  users: [
    {
       id: 1,
       name: "Victor Lima",
       email: "victorlima@gmail.com",
       password: "padrao123" 
    },
    {
       id: 20,
       name: "Joao Silva",
       email: "joao@gmail.com",
       password: "123456"
    }
  ]
};

app.get("/games", auth, (req, res) => {

  let HATEOAS = [
     {
        href: "http://localhost:8000/games",
        method: "GET",
        rel: "get_all_game"
     }
  ]

  res.statusCode = 200;
  res.json({games: DB.games, _links: HATEOAS });

});

app.get("/game/:id", auth, (req, res) => {

  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  } else {
    let id = parseInt(req.params.id);

    let game = DB.games.find((g) => g.id == id);

    if (game != undefined) {
      res.statusCode = 200;
      res.json(game);
    } else {
      res.sendStatus(404);
    }
  }

});

app.post("/game", auth, (req, res) => {
  let { title, price, year } = req.body;

  DB.games.push({
    id: 2323,
    title,
    price,
    year,
  });

  res.sendStatus(200);
});

app.delete("/game/:id", auth, (req, res) => {

  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  } else {
    let id = parseInt(req.params.id);
    let index = DB.games.findIndex((g) => g.id == id);

    if (index == -1) {
      res.sendStatus(404);
    } else {
      DB.games.splice(index, 1);
      res.sendStatus(200);
    }
  }

});

app.put("/game/:id", auth, (req, res) => {

  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  } else {
    let id = parseInt(req.params.id);

    let game = DB.games.find((g) => g.id == id);

    if (game != undefined) {

        let { title, price, year } = req.body;

        if(title != undefined){
            game.title = title;
        }

        if(price != undefined){
            game.price = price;
        }

        if(year != undefined){
            game.year = year;
        }

        res.sendStatus(200)
    } else {
      res.sendStatus(404);
    }
  }

});

app.post("/auth",(req,res) => {

   let {email, password} = req.body;

   if(email != undefined){
      let user = DB.users.find(u => u.email == email)
      
      if(user != undefined){
         
         if(user.password == password){

           jwt.sign({id: user.id, email: user.email},JWTSecret,{expiresIn:'48h'},(err, token) => {
           
           if(err){
              res.status(400);
              res.json({err: "Falha Interna !!! "});   
           }else{
              res.status(200); 
              res.json({token: token});                         
            }
         }) 
         
         }else{
            res.status(401);
            res.json({err: "Credenciais Invalidaas !!! "}); 
         }
      }else{
        
         res.status(404);
         res.json({err: "O Email evinado não existe na base de dados!"}); 
      }

   }else{
     res.status(400);
     res.json({err: "O Email enviado é invalido !!! "})
   }

});

app.listen(port, () => {
  console.log(`Api Rodando Na Porta: ${port}`);
});
