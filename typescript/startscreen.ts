import {GameRanking, GameStorage} from "./model";

function renderRankList() {
    let table = document.getElementById('hall_of_fame_table') as HTMLTableElement;
    let storage = new GameStorage('ranking', 'nick', 'scenario_select');
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
}

function scenarioOption(id, name): HTMLOptionElement {
    let option = document.createElement('option');
    option.value = id.toString();
    option.innerText = name;
    return option;
}

function findScenario(scenarios, id) {
    for (let scenario of scenarios) {
        if (scenario.id == id) return scenario;
    }
}

function fillDetails(select, scenarios) {
    let div = document.getElementById('scenario_details');
    let scenario = findScenario(scenarios, select.value);
    div.innerHTML = `<h4>${scenario.name}</h4>Author: ${scenario.owner} <p>${scenario.descr}</p>`
}

function renderScenarioSelect(scenarios) {
    let select = document.getElementById('scenario_select') as HTMLSelectElement;
    for (let scenario  of scenarios) {
        select.appendChild(scenarioOption(scenario.id, scenario.name));
    }
    fillDetails(select, scenarios);
    select.onchange = () => {
        fillDetails(select, scenarios);
    };
}

async function loadAllScenarios() {
    try {
        let response = await fetch(`/scenarios`);
        return response.json()
    } catch (e) {
        console.log(e)
    }
}

window.onload = async () => {
    renderRankList();
    let scenarios = await loadAllScenarios();
    renderScenarioSelect(scenarios);
};