const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const repo = require('./repo.js');
const {v4: uuid} = require('uuid');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/vue'));

const PORT = 3003;


//#####
let swap = (ref, a, b) => {
    let buff = ref[a];
    ref[a] = ref[b];
    ref[b] = buff;
}

let shuffle = (id) => {
    let game = repo.lobby.find(e => e.id == id);
    if(game) {
        let len = game.stack.length;
        for (let i = len - 1; i > 0; i--) {
            let n = Math.floor(Math.random() * i);
            swap(game.stack, i, n);
        }
    }
}

let dealPlayer = (game, plr, numberOfCards) => {
    if(plr == -1) {
        for(let i = 0; i < numberOfCards; i++) {
            game.skat.push(game.stack.pop());
        }
    }
    else {
        for(let i = 0; i < numberOfCards; i++) {
            game.players[plr].hand.push(game.stack.pop());
        }
    }
}

let deal = (id) => {
    let game = repo.lobby.find(e => e.id == id);
    if(game) {
        let type = game.type;
        switch(type) {
            case "skat":
                dealPlayer(game,0,3);
                dealPlayer(game,1,3);
                dealPlayer(game,2,3);
                //skat
                dealPlayer(game,-1,2);
                dealPlayer(game,0,4);
                dealPlayer(game,1,4);
                dealPlayer(game,2,4);
                dealPlayer(game,0,3);
                dealPlayer(game,1,3);
                dealPlayer(game,2,3);
                break;
            }
            //DEBUG
            // console.log(game.players[0].hand)
            // console.log(game.players[1].hand)
            // console.log(game.players[2].hand)
            // console.log('skat',game.skat)
            // console.log('stapel',game.stack)
        }
}

let assignPosis = (id, options) => {
    let game = repo.lobby.find(e => e.id == id);
    if(game) {
        //initially everything is null
        if(game.players.find(e => e.pos != null) == null) {
            //randomize? 
            if(options == null || options.initial == null) {
                game.players[0].pos = 0;
                game.players[1].pos = 1;
                game.players[2].pos = 2;
            }
            //set from outside [TODO]
            else {
                game.players[0].pos = 0;
                game.players[1].pos = 1;
                game.players[2].pos = 2;
            }
        }
        else {
            if(options == null || options.next == null) {
                for(let p in game.plaers) {
                    if(p.pos == 2) p.pos = 0;
                    else p.pos++;
                }
            }
            //set from outside (e.g. grandHand @ ramsch) [TODO]
            else {
                for(let p in game.plaers) {
                    if(p.pos == 2) p.pos = 0;
                    else p.pos++;
                }
            }
        }
    }
}

let init = (id) => { 
    let game = repo.lobby.find(e => e.id == id);
    if(game) {
        //DEBUG
        game.players[0].hand = [];
        game.players.push({id: uuid(), name: 'dummy1', hand: [], points: 0, pos: null, tricks: [] });
        game.players.push({id: uuid(), name: 'dummy2', hand: [], points: 0, pos: null, tricks: [] });
        
        //
        game.skat = [];
        game.stack = [];
        game.board = [];
        for (let p of game.players) {
            p.hand = [];
            p.tricks = [];
        }
        for (let c of repo.cards) {
            game.stack.push(c.id);
        }

        assignPosis(id);
        shuffle(id); 
        deal(id);
    }
}

let getPlayerName = (id) => {
    let user = repo.users.find(e => e.id == id);
    if (user) return user.name;
    else return null;
}
    
//

// #region GET
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.get('/gameRoute', (req, res) => {
    res.sendFile(__dirname + '/game.html');
})

app.get('/game', (req, res) => {
    let id = req.query.id;
    res.redirect('/gameRoute?id='+id);
})

app.get('/lobby', (req, res) => {
    res.sendFile(__dirname + '/lobby.html');
})


// #region DATA
app.get('/data/games', (req, res)=> {
    let ret = repo.lobby;
    res.send(ret)
})

app.get('/data/users', (req, res)=> {
    let id = req.query.id;
    let name = req.query.name
    let ret = null;
    if(id) {
        ret = repo.users.find(e => e.id == id);
    }
    else if (name) {
        ret = repo.users.find(e => e.name == name);
    }
    else {
        ret = repo.users;
    }
    res.send(ret)
})

app.get('/data/cards', (req, res) => {
    let player_id = req.query.id;
    let game_id = req.query.game;
    let game = repo.lobby.find(e => e.id == game_id)
    console.log('game', game);
    let ret = game.players.find(p => p.id == player_id).hand.map(e => repo.cards.find(c => c.id == e));
    res.send(ret);
})

// #endregion DATA

// app.get('/user', (req,res) => {
//     res.send()
// })

app.get('/test', (req,res) => {
    console.log('test');
})

app.get('/startGame', (req, res) => {
    let id = req.query.id;
    //change || to &&
    // if(game == 'skat' || repo.users.length == 3) {
        init(id);
        console.log('game intialized', id);
        res.redirect('/game?id=' + id);
        
    // }
    // else {
    //     // console.log(repo.players);
    //     res.redirect('/lobby');
    // }
    
})
// #endregion GET

// #region POST
app.post('/createGame', (req, res) => {
    let body = req.body;
    let pid = req.body.player_id;
    repo.lobby.push({id: uuid(), type: body.type, players: [{id: pid, name: getPlayerName(pid), hand: [], points: 0, pos: null, tricks: [] }], rounds: [], skat: [], board: [], stack: []});
    res.send('initialized');
})

app.post('/register', (req, res) => {
    let name = req.body.name;
    if(repo.users.find(e => e.name == name) != null) {
        // error user already exists
        res.redirect('/');
    }
    else {
        repo.users.push({id: uuid(), name: name});
        res.redirect('/lobby');
    }   
})

app.post('/logout', (req, res) => {
    let body = req.body;
    let user = repo.users.find(e => e.id == body.id);
    if(user) {
        repo.users.splice(repo.users.indexOf(user),1);
        res.send({success:true});
    }
    else res.send({success:false});
})
// #endregion POST

// ##
app.listen(PORT, () => {
    console.log('listening on port ' + PORT);
})
