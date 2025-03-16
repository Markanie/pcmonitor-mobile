import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaugeComponent } from '../components/gauge/gauge.component';
import { IonCol, IonGrid, IonRow, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonMenuButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [IonCol, IonGrid, IonRow, IonMenuButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, GaugeComponent]
})
export class StatsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
