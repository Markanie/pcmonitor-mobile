import { ElementRef, Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

export interface GaugePath {
  element?: SVGPathElement;
  radius: number;
  dialStartAngle: number; //135;
  dialEndAngle: number; //45;
  gaugeSpanAngle?: number; //360 - Math.abs(this.dialStartAngle - this.dialEndAngle);
  minVal?: number,
  maxVal?: number,
  color?: string;
  colorFn?: (value: number) => string;
}

interface ColorRange {
  min: number;
  max: number;
  colors: string[];
}

export interface GaugeData {
  color: string | null;
  colorRange: ColorRange | null;
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
  private color = '';
  private animationFrameId: number | undefined;
  @Input() value: number = 0;
  private lastValue: number = 0;
  @Input() gaugeData: GaugeData = {
    color: '',  
    colorRange: null
  }

  private path: GaugePath = {
    radius: 45,
    dialStartAngle: 135,
    dialEndAngle: 45,
    color: '#61ffb5'
  }
  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.svgContainer = this.el.nativeElement.querySelector('.gauge-container');
    if(this.gaugeData.color){
      this.color = this.gaugeData.color;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange && this.svgElement) {
      //console.log(changes['value'])
      if(this.gaugeData.colorRange){
        this.color = this.colorFn(changes['value'].currentValue, this.gaugeData.colorRange)
      }
      this.animate(changes['value'].currentValue, 1);
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
      fill: "none", stroke: "#666", "stroke-width": 4,
      d: this.createSvgArcPathString(this.path.radius, 135, 45 )
    }));

   // this.updatePath(this.path, 0)

    this.svgContainer.appendChild(this.svgElement);
  }

  private updatePath(path: GaugePath, value: number): void {
   
    let stroke = "#FFFFFF"
    stroke = this.color
    
    if(!path.element){
      path.gaugeSpanAngle = 360 - Math.abs(path.dialStartAngle - path.dialEndAngle);

      const valuePath = this.createSvgElement("path", {
        "class": "value",
        "stroke-linecap": "round",
        fill: "none", stroke: stroke, "stroke-width": 9,
        d: this.createSvgArcPathString(path.radius, path.dialStartAngle , path.dialEndAngle )
      })
      path.element = valuePath;
      this.svgElement.appendChild(valuePath);
    }
    else {
      path.element.setAttribute('stroke', stroke);
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

  colorFn(value: number, colorRange: ColorRange | null): string {                
    if (colorRange){
      const {min, max, colors} = colorRange;
      let percentage = (value-min) / (max - min);
    // Clamp percentage between 0 and 1
      percentage = Math.max(0, Math.min(1, percentage));
    // Calculate index in colors array
      const index = Math.min(Math.floor(percentage * colors.length), colors.length - 1);
    //console.log(min, max, percentage, index, colors[index]);
    return colors[index];
    } else {
      return '#FFFFFF';
    }
  }  

  animate(targetValue: number, duration: number = 1): void {
    // Cancel any ongoing animation
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  
    const startValue = this.lastValue;
    const change = targetValue - startValue;
    const startTime = performance.now();
    const animationDuration = duration * 1000; // Convert to milliseconds

    const easeInOutCubic = (pos: number): number => {
      if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 3);
      return 0.5 * (Math.pow((pos - 2), 3) + 2);
    };

      // Create or get text element for displaying value
  let textElement = this.svgElement.querySelector('.value-text') as SVGTextElement;
  if (!textElement) {
    textElement = this.createSvgElement("text", {
      "class": "value-text",
      "x": "50",
      "y": "50",
      "text-anchor": "middle",
      "font-size": "15",
      "font-weight": "bold",
      "fill":"rgb(184, 184, 184)"
    });
    this.svgElement.appendChild(textElement);
  }
    
    const animateStep = (currentTime: number): void => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1); // Clamp to 1
      // Simple linear interpolation
      const newValue = change * easeInOutCubic(progress) + startValue;
      
      // Update the gauge with the intermediate value
      this.value = newValue;
      if (this.gaugeData.colorRange) {
        this.color = this.colorFn(newValue, this.gaugeData.colorRange);
      }
      //this.updatePath(this.path, newValue);
     // this.updateText(this.text, newValue);

      const percentValue = this.valueToPercentage(newValue);
      this.updatePath(this.path, percentValue);

      textElement.textContent = this.formatDisplayValue(newValue);
      
      if (progress < 1) {
        // Continue animation
        this.animationFrameId = requestAnimationFrame(animateStep);
      } else {
        // Animation complete
        this.animationFrameId = undefined;
        this.lastValue = this.value;
      }
    };
    
    // Start the animation
    this.animationFrameId = requestAnimationFrame(animateStep);
  }

  private formatDisplayValue(value: number): string {
    // You can customize this format as needed
    return value.toFixed(1);
  }

private valueToPercentage(value: number): number {
  const minVal = this.gaugeData.colorRange?.min ?? 0;
  const maxVal = this.gaugeData.colorRange?.max ?? 100;
  return ((value - minVal) / (maxVal - minVal)) * 100;
}

private clampValue(value: number): number {
  const minVal = this.gaugeData.colorRange?.min ?? 0;
  const maxVal = this.gaugeData.colorRange?.max ?? 100;
  return Math.max(minVal, Math.min(maxVal, value));
}

}
