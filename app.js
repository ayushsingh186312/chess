//import hua
const express=require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const { log } = require("console");


//create
const app = express();

const server = http.createServer(app);
const io=socket(server);
//web sockets me server aur client ke bich connection close nahi hota hai therefore info bidirectional flow hote retha hai efficient for chat application aur game etc....

const chess = new Chess();

let players= {};
let currentPlayer = "w";

app.set("view engine", "ejs");//embedded js templating engine
app.use(express.static(path.join(__dirname,"public")));//allows to use js css

app.get("/", (req,res) => {
    res.render("index",{title:"Chess Game"});
});

io.on("connection",function(uniquesocket) {
    console.log("connected");

    if(!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");

    }
     else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
     }
     else {
        uniquesocket.emit("spectatorRole");
     }

    uniquesocket.on("disconnect",function(){
        if(uniquesocket.id ===players.white){
            delete players.white;

        }
        else if (uniquesocket.id===players.back)
            {
                delete players.back;
            }
    });
    uniquesocket.on("move",(move) => {
        try {
            if (chess.turn()==="w" && uniquesocket.id !== players.white) return;
            if (chess.turn()==="b" && uniquesocket.id !== players.black) return;
            
            const result =chess.move(move);

            if(result) {
                currentPlayer=chess.turn();
                io.emit("move",move);
                io.emit("boardState",chess.fen())//fen():current state of the bord deta hai

            }
            else{
                console.log("Invalid move : ",move);
                uniquesocket.emit("invalidMove",move);
            }
        }
        catch (err) {
            console.log(err);
            uniquesocket.emit("Invalid move : ",move);
            

        }
    })
}); 

server.listen(3000, function (){
    console.log("listening on port 3000");
});