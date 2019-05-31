import {SMap} from "./smap";
import {ItemStock, Planet} from "./model";

export class PlanetBlockView {
    elem: HTMLDivElement;
    constructor(name: string, planet: Planet, onclick: (string) => void) {
        this.elem = document.createElement("div");
        this.elem.classList.add("planet_item", "clickable");
        this.elem.innerHTML =
            `<h1>${name}</h1><div> ${planet.x}, ${planet.y}</div>`;
        this.elem.onclick = () => { onclick(name) };
    }
}

export class PlanetPopupView {
    elem: HTMLDivElement;
    available_cells: SMap<HTMLTableCellElement>;
    starships_list: HTMLUListElement;

    private static makeHeader(name: string): HTMLElement {
        let header = document.createElement("header");
        let h1 = document.createElement("h1");
        h1.innerText = name;
        header.appendChild(h1);
        return header;
    }

    private makeItemRow(item: string, stock: ItemStock): HTMLTableRowElement {
        let tr = document.createElement("tr");
        tr.innerHTML = `<td>${item}</td>`;
        let td = document.createElement("td");
        td.innerText = stock.available.toString();
        this.available_cells[item] = td;
        tr.appendChild(td);
        tr.innerHTML += `<td>${stock.buy_price}</td><td>${stock.sell_price}</td>`;
        return tr;
    }

    private static makeHeaderRow(): HTMLTableRowElement {
        let tr = document.createElement("tr");
        tr.innerHTML =
            `<th>Item</th><th>Available</th><th>Buy price</th><th>Sell price</th>`
        return tr;
    }

    private makeStockTable(stock: SMap<ItemStock>): HTMLTableElement {
        let items_table = document.createElement("table");
        items_table.appendChild(PlanetPopupView.makeHeaderRow());
        for (let item in stock) {
            items_table.appendChild(this.makeItemRow(item, stock[item]));
        }
        return items_table;
    }

    private makeStarshipsList(starships: string[], starship_onclick: (string) => void): HTMLUListElement {
        let ul: HTMLUListElement = document.createElement("ul");
        for (let starship of starships) {
            let li = document.createElement("li");
            li.classList.add("clickable");
            li.innerText = starship;
            li.onclick = () => { starship_onclick(starship) };
            ul.appendChild(li);
        }
        return ul;
    }

    constructor(public name: string, planet: Planet, starships: string[], private starship_onclick: (string) => void) {
        this.elem = document.createElement("div");
        this.hide();
        this.elem.classList.add("planet_info");
        this.elem.appendChild(PlanetPopupView.makeHeader(name));
        let planet_items = document.createElement("div");
        planet_items.classList.add("planet_items");
        planet_items.innerHTML += `<h2>Items</h2>`;
        this.available_cells = {};
        planet_items.appendChild(this.makeStockTable(planet.stock));
        this.elem.appendChild(planet_items);
        let planet_starships = document.createElement("div");
        planet_starships.classList.add("planet_spaceships");
        planet_starships.innerHTML += `<h2>Spaceships</h2>`;
        this.starships_list = this.makeStarshipsList(starships, starship_onclick);
        planet_starships.appendChild(this.starships_list);
        this.elem.appendChild(planet_starships);
    }

    show() {
        this.elem.style.display = 'block';
    }

    hide() {
        this.elem.style.display = 'none';
    }

    updateStarships(starships: string[]) {
        this.starships_list = this.makeStarshipsList(starships, this.starship_onclick);
    }

    updateStock(stock: SMap<ItemStock>) {
        for (let item in stock) {
            this.available_cells[item].innerText = stock[item].available.toString();
        }
    }
}
