import { ElementRef, Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

export interface GaugePath {
  element?: SVGPathElement;
  radius: number;
  dialStartAngle: number; //135;
  dialEndAngle: number; //45;
  gaugeSpanAngle?: number; //360 - Math.abs(this.dialStartAngle - this.dialEndAngle);
  color: string;
  colorFn?: (value: number) => string;
}

export interface GaugeConfig {
  radius?: number;
  dialStartAngle?: number;
  dialEndAngle?: number;
  color?: string;
  colorFn?: (value: number) => string;
}

@Component({
  selector: 'gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss'],
})
export class GaugeComponent  implements OnInit, OnChanges {
  private SVG_NS = "http://www.w3.org/2000/svg";
  private svgContainer!: HTMLElement;
  private svgElement!: SVGElement;
  private svg_width = 500;
  private svg_height = 230;

  @Input() config: GaugeConfig = {};
  @Input() value: number = 0;

  private path: GaugePath = {
    radius: 45,
    dialStartAngle: 135,
    dialEndAngle: 45,
    color: '#129'
  }
  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.svgContainer = this.el.nativeElement.querySelector('.gauge-container');

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange && this.svgElement) {
      this.updatePath(this.path, this.value);
    }
  }

  ngAfterViewInit(): void {
    this.svgElement = this.createSvgElement("svg", {
      "height": this.svg_height,
      "viewBox": "0 0 100 100", 
      "class": "gauge",
    });


    this.svgElement.appendChild(  this.createSvgElement("path", {
      "class": "dail",
      fill: "none", stroke: "#666", "stroke-width": 3,
      d: this.createSvgArcPathString(this.path.radius, 135, 45 )
    }));

    this.updatePath(this.path, 50)

    this.svgContainer.appendChild(this.svgElement);
  }

  private updatePath(path: GaugePath, value: number): void {
    if(!path.element){
      path.gaugeSpanAngle = 360 - Math.abs(path.dialStartAngle - path.dialEndAngle);
      const valuePath = this.createSvgElement("path", {
        "class": "value",
        fill: "none", stroke: "#39ff14", "stroke-width": 6,
        d: this.createSvgArcPathString(path.radius, path.dialStartAngle , path.dialEndAngle )
      })
      path.element = valuePath;
      this.svgElement.appendChild(valuePath);
    }
    this.setSvgArcPathString(this.path, value)
  }

  createSvgElement<K extends keyof SVGElementTagNameMap>(
    name: K,
    attrs: Record<string, string | number>
  ): SVGElementTagNameMap[K] {
    const elem = document.createElementNS(this.SVG_NS, name) as SVGElementTagNameMap[K];
    for (const [attrName, value] of Object.entries(attrs)) {
      elem.setAttribute(attrName, value.toString());
    }
    return elem;
  }

  setSvgArcPathString(path: GaugePath, value: number) {
    let angle = 0;
    
    if (path.gaugeSpanAngle) {
      angle = this.getAngle(value, path.gaugeSpanAngle);
    }
    
    const endAngle = path.dialStartAngle + angle;
    const coords = this.getDialCoords(path.radius, path.dialStartAngle, endAngle);
    const start = coords.start;
    const end = coords.end;
    
    const flag = Math.abs(endAngle - path.dialStartAngle) <= 180 ? 0 : 1;
    
    if (path.element) {
      path.element.setAttribute("d", [
        "M", start.x, start.y, 
        "A", path.radius, path.radius, 0, flag, 1, end.x, end.y
      ].join(" "));
    }
  }

  createSvgArcPathString(radius: number, startAngle: number, endAngle: number): string {
    const coords = this.getDialCoords(radius, startAngle, endAngle);
    const start = coords.start;
    const end = coords.end;
    const flag = Math.abs(endAngle - startAngle) <= 180 ? 1 : 0;
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, flag, 1, end.x, end.y
    ].join(" ");
  }


  getDialCoords(radius: number, startAngle: number, endAngle: number): {
    start: { x: number, y: number };
    end: { x: number, y: number };
      } {
      const cx = 50;
      const cy = 50;
      return {
        end: this.getCartesian(cx, cy, radius, endAngle),
        start: this.getCartesian(cx, cy, radius, startAngle)
        };
  }

  getCartesian(cx: number, cy: number, radius: number, angle: number): { x: number, y: number } {
    const rad = angle * Math.PI / 180;
    return {
      x: Math.round((cx + radius * Math.cos(rad)) * 1000) / 1000,
      y: Math.round((cy + radius * Math.sin(rad)) * 1000) / 1000
    };
  }

  getAngle(percentage: number, gaugeSpanAngle: number): number {
    return percentage * gaugeSpanAngle / 100;
  }

}
