async function loadScenarios() {
    try {
        let response = await fetch(`/scenarios/user`);
        return response.json()
    } catch (e) {
        console.log(e)
    }
}

async function deleteScenarioReq(id) {
    let response = await fetch(`/scenarios/${id}`, {method: 'delete'});
    if (response.status == 200) {
        window.location.reload();
    }
}

function scenarioDiv(id, name, description): HTMLDivElement {
    let elem = document.createElement('div');
    elem.classList.add('block');
    elem.classList.add('row-flex');
    elem.classList.add('scenario');
    elem.innerHTML = `<div><h2>${name}</h2><button>Delete scenario</button></div><div>${description}</div>`;
    let button = elem.getElementsByTagName('div')[0]
                     .getElementsByTagName('button')[0] as HTMLButtonElement;
    button.onclick = async () => {await deleteScenarioReq(id)};
    return elem;
}

function renderScenarios(scenarios) {
    let container = document.getElementById('container') as HTMLDivElement;
    for (let scenario of scenarios) {
        container.appendChild(scenarioDiv(scenario.id, scenario.name, scenario.descr));
    }
}

async function main() {
    let scenarios = await loadScenarios();
    renderScenarios(scenarios);
}

window.onload = main;