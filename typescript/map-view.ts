import {GameModel, Planet, Starship, Travel} from "./model";
import {SMap} from "./smap";
import {PlanetBlockView} from "./planet-view";

function coord(c) {
    return 25 + c * 5.5;
}

class PlanetIconView {

    constructor (private planet, private planets: SMap<Planet>, private map_svg: SVGSVGElement,
                 private onclick: (string) => void) {
        map_svg.innerHTML +=
            `<circle cx="${coord(planets[planet].x)}" 
                         cy="${coord(planets[planet].y)}"
                         r="10"
                         fill="#c397b1"></circle>`;
        let text = document.createElementNS("http://www.w3.org/2000/svg", 'text') as SVGTextElement;
        text.setAttribute('x', coord(planets[planet].x).toString());
        text.setAttribute('y', coord(planets[planet].y).toString());
        text.setAttribute('fill', 'white');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '15');
        text.style.cursor = 'pointer';
        text.textContent = planet;
        text.onclick = (() => {onclick(planet)});
        // console.log(text);
        map_svg.appendChild(text);
    }
}

class StarshipIconView {
    constructor(private starship, private starships: SMap<Starship>, private planets: SMap<Planet>,
                private map_svg: SVGSVGElement, private onclick: (string) => void) {
        let x, y;
        let visibility = "hidden";
        if (starships[this.starship].position instanceof Travel) {
            let t = starships[starship].position as Travel;
            let s = t.start;
            let d = t.destination;
            let dest_x = planets[d].x;
            let dest_y = planets[d].y;
            let start_x = planets[s].x;
            let start_y = planets[s].y;
            let time = Math.ceil(Math.sqrt((dest_x - start_x) * (dest_x - start_x)
                + (dest_y - start_y)  * (dest_y - start_y)));
            x = start_x + (dest_x - start_x) * t.time_left / time;
            y = start_y + (dest_y - start_y) * t.time_left / time;
            visibility = "visible";
        } else {
            x = planets[starships[this.starship].position as string].x;
            y = planets[starships[this.starship].position as string].y;
        }
        map_svg.innerHTML +=
            `<text x="${coord(x)}"
                   y="${coord(y)}"
                   text-anchor="middle"
                   font-size="13"
                   font-weight="bold"
                   fill="white"
                   style="cursor: pointer;"
                   visibility="${visibility}">${starship}</text>`;
        let texts = map_svg.getElementsByTagName('text');
        let text = texts[texts.length - 1];
        text.onclick = () => {this.onclick(this.starship)}
    }

}



export class MapView {
    mapSvg: SVGSVGElement;
    planet_icons: SMap<PlanetIconView>;
    starship_icons: SMap<StarshipIconView>;

    drawStarships() {
        this.starship_icons = {};
        let starships = this.gameModel.starships;
        for (let starship in starships) {
                this.starship_icons[starship] = new StarshipIconView(starship, starships,
                    this.gameModel.planets, this.mapSvg, this.starship_onclick);
        }
    }

    drawPanets() {
        this.planet_icons = {};
        let planets = this.gameModel.planets;
        for (let planet in planets) {
            this.planet_icons[planet] = new PlanetIconView(planet, planets, this.mapSvg, this.planet_onclick);
        }
    }

    update() {
        this.mapSvg.innerHTML = '';
        this.drawPanets();
        this.drawStarships();
    }

    constructor(public gameModel: GameModel, private planet_onclick: (planet: string) => void,
                private starship_onclick: (planet: string) => void) {
        this.mapSvg =
            document.getElementsByTagNameNS("http://www.w3.org/2000/svg", 'svg')[0] as SVGSVGElement;

    }

}