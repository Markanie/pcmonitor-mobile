import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonMenuButton, 
  IonButtons, 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  ToastController
} from '@ionic/angular/standalone';
import { PcmonitorapiService, SoundDevice } from '../pcmonitorapi.service';
import { Subscription } from 'rxjs';
import { checkmarkCircleOutline, ellipseOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sounddevices',
  templateUrl: './sounddevices.page.html',
  styleUrls: ['./sounddevices.page.scss'],
  standalone: true,
  imports: [
    IonMenuButton, 
    IonButtons, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    CommonModule, 
    FormsModule
  ]
})
export class SounddevicesPage implements OnInit, OnDestroy {
  playbackDevices: SoundDevice[] = [];
  recordingDevices: SoundDevice[] = [];
  private deviceSubscription?: Subscription;
  isSwitching = false;

  constructor(
    private pcMonitorApi: PcmonitorapiService,
    private http: HttpClient,
    private toastController: ToastController
  ) {
    // Add required icons
    addIcons({ checkmarkCircleOutline, ellipseOutline });
  }

  ngOnInit() {
    this.loadSoundDevices();
  }

  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.deviceSubscription) {
      this.deviceSubscription.unsubscribe();
    }
  }

  private loadSoundDevices() {
    // Unsubscribe from existing subscription if it exists
    if (this.deviceSubscription) {
      this.deviceSubscription.unsubscribe();
    }
    
    // Subscribe to the sound devices stream with a 5-second refresh interval
    this.deviceSubscription = this.pcMonitorApi.getSoundDevicesStream(5000)
      .subscribe({
        next: (devices) => {
          // Filter devices by type
          this.playbackDevices = this.pcMonitorApi.getSoundDevicesByType('Playback', devices);
          this.recordingDevices = this.pcMonitorApi.getSoundDevicesByType('Recording', devices);
        },
        error: (error) => {
          console.error('Error loading sound devices:', error);
        }
      });
  }

  // Helper method to check if a device is the default one
  isDefaultDevice(device: SoundDevice): boolean {
    return device.default === 'true';
  }

  // Switch to a different sound device
  switchDevice(device: SoundDevice) {
    if (this.isDefaultDevice(device) || this.isSwitching) {
      return; // Skip if already default or if another switch is in progress
    }

    this.isSwitching = true;
    
    // Use the correct base URL
    // If your API is running on a different port/domain, you need to specify it correctly
    const apiUrl = `/api/sound/switchdevice/${device.index}`;
    
    // Use responseType: 'text' to avoid JSON parsing errors
    this.http.get(apiUrl, { responseType: 'text' }).subscribe({
      next: (response) => {
        console.log('Switch response:', response);
        // Refresh the device list after successful switch
        this.loadSoundDevices();
        this.presentToast(`Switched to ${device.name}`);
        this.isSwitching = false;
      },
      error: (error) => {
        console.error('Error switching device:', error);
        this.presentToast('Failed to switch device');
        this.isSwitching = false;
      }
    });
  }

  // Display toast message
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }
}