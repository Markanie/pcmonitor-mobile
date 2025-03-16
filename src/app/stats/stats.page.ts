import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaugeComponent } from '../components/gauge/gauge.component';
import { IonCol, IonGrid, IonRow, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonMenuButton } from '@ionic/angular/standalone';
import { PcmonitorapiService, SensorNode } from '../pcmonitorapi.service';
import { Subscription } from 'rxjs';

interface GaugeConfig {
  id: string;
  title: string;
  sensorId: string;
  sensor: SensorNode | null;
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [IonCol, IonGrid, IonRow, IonMenuButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, GaugeComponent]
})
export class StatsPage implements OnInit, OnDestroy {
  hardwareData: SensorNode | null = null;
  gauges: GaugeConfig[] = [
    { id: 'cpu-load', title: 'CPU Load', sensorId: '/amdcpu/0/load/1', sensor: null },
    { id: 'cpu-temp', title: 'CPU Temperature', sensorId: '/amdcpu/0/temperature/2', sensor: null },
    { id: 'gpu-load', title: 'GPU Load', sensorId: '/gpu-nvidia/0/load/0', sensor: null },
    { id: 'gpu-temp', title: 'GPU Temperature', sensorId: '/gpu-nvidia/0/temperature/0', sensor: null },
    { id: 'ram-usage', title: 'RAM Usage', sensorId: '/ram/load/0', sensor: null }
  ];
  
  private subscription: Subscription = new Subscription();

  constructor(private pcMonitorService: PcmonitorapiService) { }

  ngOnInit() {
    this.subscription = this.pcMonitorService.getHardwareDataStream(3000).subscribe(data => {
      this.hardwareData = data;
      
      // Update all gauges with their corresponding sensor data
      if(this.hardwareData){
      this.gauges.forEach(gauge => {
        const sensorNode = this.pcMonitorService.findSensorById(gauge.sensorId, this.hardwareData!);
        if (sensorNode) {
          gauge.sensor = sensorNode;
        }
      });
    }
    });
  }

    // Helper method to safely convert sensor values to numbers
  getSensorValue(sensor: SensorNode | null): number {
      if (!sensor || sensor.Value === undefined || sensor.Value === null) {
        return 0;
      }
      return typeof sensor.Value === 'string' ? parseFloat(sensor.Value) : sensor.Value;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}