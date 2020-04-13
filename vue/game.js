let app = new Vue({
    el: '#app',
    data() {
        return {
            hand: [],
            name: null,
            user_id: null,
            game_id: null,
            canPlay: true
        }
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.name = localStorage.getItem('user');
            this.user_id = localStorage.getItem('user_id');
            
            let params = new URLSearchParams(window.location.search);
            this.game_id = params.get('id');
            localStorage.setItem('game_id', this.game_id);
        },
        showCards() {
            fetch('/data/cards?id=' + this.user_id + '&game=' + this.game_id)
            .then(data => {
                data.text()
                    .then(t => {
                        for (let c of JSON.parse(t)) {
                            this.hand.push(c);
                        }
                    });
            });
        },
        play(card_id) {
            if(this.canPlay) {
                fetch('playCard?id=' + card_id + '&game=' + this.game_id + '&player=' + this.user_id)
                .then(d => {
                    this.canPlay = false;
                });
            }
        },
        takeTrick() {
            fetch('takeTrick?player=' + this.user_id + '&game=' + this.game_id)
        }
    }
});
