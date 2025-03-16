import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonMenuButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar  } from '@ionic/angular/standalone';

@Component({
  selector: 'app-sounddevices',
  templateUrl: './sounddevices.page.html',
  styleUrls: ['./sounddevices.page.scss'],
  standalone: true,
  imports: [IonMenuButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SounddevicesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
