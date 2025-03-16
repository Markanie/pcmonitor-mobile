import { Component, OnInit, OnDestroy  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaugeComponent } from '../components/gauge/gauge.component';
import { IonCol, IonGrid, IonRow, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonMenuButton } from '@ionic/angular/standalone';
import { PcmonitorapiService, SensorNode } from '../pcmonitorapi.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [IonCol, IonGrid, IonRow, IonMenuButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, GaugeComponent]
})
export class StatsPage implements OnInit, OnDestroy {
  hardwareData: SensorNode | null = null;
  cpuTemp: SensorNode | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private pcMonitorService: PcmonitorapiService) { }

  ngOnInit() {
    this.pcMonitorService.getHardwareData().subscribe(data => {
      this.hardwareData = data;
      
      // Find CPU component
      const cpu = this.pcMonitorService.getComponentByName('AMD Ryzen 9 5900X', data);
      if (cpu) {
        // Find CPU temperature sensor
        const temps = this.pcMonitorService.getSensorsByType('Temperature', cpu);
        if (temps.length > 0) {
          this.cpuTemp = temps[0];
        }
      }
    });

    // Option 2: Real-time updates (uncomment to use)
    /*
    this.subscription = this.pcMonitorService.getHardwareDataStream(3000).subscribe(data => {
      this.hardwareData = data;
      // Similar processing as above
    });
    */
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
