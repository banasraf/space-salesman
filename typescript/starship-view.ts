import {Travel} from "./model";
import {Spaceport, Trade} from "./controller";
import {SMap} from "./smap";

export class StarshipBlockView {
    elem: HTMLDivElement;
    constructor(name: string, position: string, onclick: (string) => void) {
        this.elem = document.createElement("div");
        this.elem.classList.add("spaceship_item", "clickable");
        this.elem.innerHTML =
            `<h1>${name}</h1><div>${position}</div>`;
        this.elem.onclick = () => { onclick(name) };
    }

    updatePosition(position: string | Travel) {
        let div: HTMLDivElement = this.elem.getElementsByTagName("div")[0];
        if (position instanceof Travel) {
            div.innerText = `${position.start} → ${position.destination}`;
        } else {
            div.innerText = position;
        }
    }
}

export class StarshipPopupView {
    elem: HTMLDivElement;
    cargo_table: HTMLTableElement;
    shop_table: HTMLTableElement;
    shop_div: HTMLDivElement;
    travel_div: HTMLDivElement;
    travel_select: HTMLSelectElement;
    on_planet: boolean;
    position_text: HTMLElement;

    private addHeader(name: string, planet: string, planet_click) {
        let h = document.createElement("header");
        h.innerHTML = `<h1>${name}</h1><h2><a class="clickable">${planet}</aclass></h2>`;
        this.position_text =h.getElementsByTagName('h2')[0];
        this.position_text.getElementsByTagName('a')[0].onclick
            = () => {planet_click(planet)};
        this.elem.appendChild(h);
    }

    private generateCargoTable(trade: Trade, planet: string) {
        this.cargo_table.innerHTML = "<tr><th>Item</th><th>Quantity</th><th>Sell price</th><th></th></tr>";
        for (let item in trade.cargo) {
            let tr = document.createElement('tr');
            tr.innerHTML
                = `<tr><td>${item}</td><td>${trade.cargo[item]}</td><td>${trade.sellPrice(item)}</td><td></td></tr>`;
            if (trade.canSell(item)) {
                let sell_button = document.createElement("span");
                sell_button.classList.add("clickable");
                sell_button.onclick = () => { this.sell(this.name, planet, item) };
                sell_button.innerText = 'SELL';
                tr.lastChild.appendChild(sell_button);
            }
            this.cargo_table.appendChild(tr);
        }
    }

    private generateCargoTableInTravel(cargo: SMap<number>) {
        this.cargo_table.innerHTML = "<tr><th>Item</th><th>Quantity</th></tr>"
        for (let item in cargo) {
            let tr = document.createElement("tr");
            tr.innerHTML = `<td>${item}</td><td>${cargo[item]}</td>`
            this.cargo_table.appendChild(tr);
        }
    }

    private addCargoInfo(trade: Trade, planet: string) {
        let div = document.createElement("div");
        div.classList.add("cargo_info");
        div.innerHTML += `<h2>Cargo</h2><h3>Size: ${trade.cargo_hold_size}</h3>`;
        this.cargo_table = document.createElement("table");
        this.generateCargoTable(trade, planet);
        div.appendChild(this.cargo_table);
        this.elem.appendChild(div);
    }

    click(planet, item) {
        console.log('buy');
        this.buy(this.name, planet, item)
    }

    private generateShopTable(trade: Trade, planet: string, credits: number) {
        this.shop_table.innerHTML = `<tr><th>Item</th><th>Quantity</th><th>Buy price</th><th></th></tr>`;
        for (let item in trade.stock) {
            let tr = document.createElement('tr');
            tr.innerHTML
                = `<tr><td>${item}</td><td>${trade.stock[item].available}</td><td>${trade.buyPrice(item)}</td><td></td></tr>`;
            if (trade.canBuy(item, credits)) {
                let buy_button = document.createElement("span");
                buy_button.classList.add("clickable");
                buy_button.onclick = () => { this.buy(this.name, planet, item) };
                buy_button.innerText = 'BUY';
                tr.lastChild.appendChild(buy_button);
            }
            this.shop_table.appendChild(tr);
        }
    }

    private addShop(trade: Trade, planet: string, credits: number) {
        let div = document.createElement("div");
        div.classList.add("buy_menu");
        div.innerHTML += `<h2>Shop</h2>`;
        this.shop_table = document.createElement("table");
        this.generateShopTable(trade, planet, credits);
        div.appendChild(this.shop_table);
        this.elem.appendChild(div);
        this.shop_div = div;
    }

    private addTravel(spaceport: Spaceport) {
        this.travel_div = document.createElement('div');
        this.travel_div.classList.add('travel_info');
        this.travel_div.innerHTML += `<h2>Travel</h2>`;
        let form = document.createElement('form');
        form.classList.add('travel_form');
        this.travel_div.appendChild(form);
        form.innerHTML += `Travel to: `;
        this.travel_select = document.createElement('select');
        form.appendChild(this.travel_select);
        this.travel_select.innerHTML += `Travel to:`;
        for (let dest of spaceport.listDestinations()) {
            let option = document.createElement('option');
            option.value = dest;
            option.innerText = dest;
            this.travel_select.appendChild(option);
        }
        let button = document.createElement('button');
        button.innerText = "Go!";
        button.type = "button";
        button.onclick = () => {this.travel(this.name, this.travel_select.value)};
        form.appendChild(button);
        this.elem.appendChild(this.travel_div);
    }

    constructor(public name: string, planet: string,
                trade: Trade, spaceport: Spaceport, credits: number,
                private sell: (starship: string, planet: string, item: string) => void,
                private buy: (starship: string, planet: string, item: string) => void,
                private travel: (starship: string, destination: string) => void,
                private planet_click: (planet: string) => void) {
        this.elem = document.createElement("div");
        this.elem.classList.add("spaceship_info");
        this.on_planet = true;
        this.hide();
        this.addHeader(name, planet, planet_click);
        this.addCargoInfo(trade, planet);
        this.addShop(trade, planet, credits);
        this.addTravel(spaceport);
    }

    updateOnPlanet(planet: string, trade: Trade, spaceport: Spaceport, credits: number) {
        this.generateCargoTable(trade, planet);
        this.generateShopTable(trade, planet, credits);
        this.position_text.innerHTML = `<a class="clickable">${planet}</a>`;
        this.position_text.getElementsByTagName('a')[0].onclick = () => {this.planet_click(planet)};
        this.shop_div.style.display = 'block';
        this.travel_div.style.display = 'block';
    }

    updateInTravel(cargo: SMap<number>, travel: Travel) {
        this.position_text.innerHTML
            = `<a class='clickable'>${travel.start}</a> → <a class="clickable"> ${travel.destination} </a>`;
        this.position_text.getElementsByTagName('a')[0].onclick
            = () => {this.planet_click(travel.start)};
        this.position_text.getElementsByTagName('a')[1].onclick
            = () => {this.planet_click(travel.destination)};
        this.shop_div.style.display = 'none';
        this.travel_div.style.display = 'none';
        this.generateCargoTableInTravel(cargo);
    }

    show() {
        this.elem.style.display = 'block';
    }

    hide() {
        this.elem.style.display = 'none';
    }


}