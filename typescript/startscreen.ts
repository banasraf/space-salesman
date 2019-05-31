import {GameRanking, GameStorage} from "./model";



function renderRankList() {
    let table = document.getElementById('hall_of_fame_table') as HTMLTableElement;
    let storage = new GameStorage('ranking', 'name');
    let ranking = <GameRanking>storage.readRanking();
    for (let i in ranking.rank) {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${(+i)+1}</td><td>${ranking.rank[i].name}</td><td>${ranking.rank[i].credits}</td>`
        table.appendChild(tr);
    }
    if (ranking.rank.length < 5) {
        for (let i = ranking.rank.length; i < 5; ++i) {
            let tr = document.createElement('tr');
            tr.innerHTML = `<td>${(+i)+1}</td><td>-------------------</td><td>-</td>`
            table.appendChild(tr);
        }
    }
    let popup_layer = document.getElementById('popup_layer');
    let play_button = document.getElementById('play_img');
    play_button.onclick = () => {popup_layer.style.display = 'flex'};
    popup_layer.onclick = (event: Event) => {
        if (event.target == popup_layer) {
            popup_layer.style.display = 'none';
        }
    };
    let nick_form: HTMLFormElement = document.getElementById('nick_form') as HTMLFormElement;
    nick_form.onsubmit = () => {
        storage.setName(nick_form.getElementsByTagName('input')[0].value);
        window.location.replace('game.html');
        return false;
    };
}

window.onload = () => {
    renderRankList();

};