let app = new Vue({
    el: '#app',
    data () {
        return {
            name: null,
            id: null,
            games: [],
            users: []
        }
    },
    created() {
        this.name = localStorage.getItem('user');
        
        if(this.id == null) {
            fetch("/data/users?name=" + this.name)
            .then(d => 
                d.json().then(data => {
                    this.id = data.id;
                    localStorage.setItem('user_id', this.id);
                }));
        }

        this.getGames();

        fetch("/data/users")
        .then(d => 
            d.json().then(data => {
                console.log('d',data);
                this.users = data;
            })
        );
    },
    methods: {
        post(url, data) {
            return fetch(url, {
                method: "POST",
                headers: {
                    "Accept": "application/json, text/plain",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
    
        },
        logout() {
            this.post("/logout", {
                id: this.id
            })
            .then(d => d.json().then(data => {
                    console.log('logoutdata', data)
                    if(data.success) window.location.href = '/';
                })
            );
        },
        getGames() {
            fetch("/data/games")
            .then(d => 
                d.json().then(data => {
                    this.games = data;
                })
            );
        },
        start(id) {
            fetch('/startGame?id=' + id)
                .then(e => window.location.href= '/game?id=' + id);
        },
        create() {
            this.post('/createGame',{type:"skat", player_id: this.id}).then(d => this.getGames());            
        }
    }
});