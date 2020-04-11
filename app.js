const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const repo = require('./repo.js');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/vue'));

const PORT = 3003;


//#####
let shuffle = () => {
    let len = repo.stack.length;
    for (let i = len - 1; i > 0; i--) {
        let n = Math.floor(Math.random() * i);
        // swap
        let buff = repo.stack[i];
        repo.stack[i] = repo.stack[n];
        repo.stack[n] = buff;
    }
}

let deal = (game) => {
    game = game || 'skat';
    switch(game) {
        case "skat":
            dealPlayer(0,3);
            dealPlayer(1,3);
            dealPlayer(2,3);
            //skat
            dealPlayer(-1,2);
            dealPlayer(0,4);
            dealPlayer(1,4);
            dealPlayer(2,4);
            dealPlayer(0,3);
            dealPlayer(1,3);
            dealPlayer(2,3);
            break;
    }
    //DEBUG
    // console.log(repo.players[0].hand)
    // console.log(repo.players[1].hand)
    // console.log(repo.players[2].hand)
    // console.log('skat',repo.skat)
    // console.log('stapel',repo.stack)
}

let dealPlayer = (plr, number) => {
    if(plr == -1) {
        for(let i = 0; i < number; i++) {
            repo.skat.push(repo.stack.pop());
        }
    }
    else {
        for(let i = 0; i < number; i++) {
            repo.players[plr].hand.push(repo.stack.pop());
        }
    }
}

let init = () => { 
    //DEBUG
    repo.players.push({id: repo.players_id++, name: 'dummy1', hand: []});
    repo.players.push({id: repo.players_id++, name: 'dummy2', hand: []});
    repo.players.push({id: repo.players_id++, name: 'dummy3', hand: []});
    repo.stack = [];
    for (let c of repo.cards) {
        repo.stack.push(c.id);
    }
    shuffle(); 
    deal();
}
    
//

// # GET
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.get('/game', (req,res) => {
    res.sendFile(__dirname + '/game.html');
})

app.get('/cards', (req, res) => {
    console.log('id: ',req.query.name);
    let player_id = repo.players.find(e => e.name == req.query.name).id;
    console.log('player_id', player_id);
    let ret = repo.players.find(player_id).hand.map(e => repo.cards.find(c => c.id == e));
    // ^ untested
    //let ret = repo.players[player_id].hand.map(e => repo.cards.find(c => c.id == e));
    console.log('ret', ret);
    res.send(ret);
})

// app.get('/user', (req,res) => {
//     res.send()
// })

app.get('/test', (req,res) => {
    console.log('test');
})

app.get('/startGame', (req, res) => {
    let game = req.query.game;
    console.log('game', game);
    //change || to &&
    if(game == 'skat' || repo.players.length == 3) {
        init();
        console.log('game ntialized');
        res.send('initialized');
    }
    else {
        // console.log(repo.players);
        res.redirect('/game');
    }
    
})

// # POST
app.post('/register', (req, res) => {
    repo.players.push({id: repo.players_id++, name: req.body.name, hand: [], tricks: []});
    res.redirect('/game');
})

// ##
app.listen(PORT, () => {
    console.log('listening on port ' + PORT);
})
