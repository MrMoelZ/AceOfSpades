let app = new Vue({
    el: '#app',
    data() {
        return {
            msg: 'lelel',
            hand: [],
            name: null
        }
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.name = localStorage.getItem('user');
            this.user_id = localStorage.getItem('user_id');
        },
        start() {
            fetch('/startGame?game=skat');
        },
        showCards() {
            fetch('/cards?name=' + this.name)
                .then(data => {
                    console.log('in data')
                    data.text()
                        .then(t => {
                            for (let c of JSON.parse(t)) {
                                this.hand.push(c);
                            }
                        });
                });
        }
    }
});
