import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, catchError, map, of, timer, switchMap } from 'rxjs';

export interface SensorNode {
  Children: SensorNode[];
  ImageURL: string;
  Max: string;
  Min: string;
  SensorId?: string;
  Text: string;
  Type?: string;
  Value: string;
  id: number;
}

export interface SoundDevice {
  default: string;
  device: string;
  index: string;
  name: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class PcmonitorapiService {
  private hardwareApiUrl  = '/api/hardware/';
  private soundApiUrl = '/api/sound/';
  
  constructor(private http: HttpClient) { }
  
  /**
   * Fetches hardware monitoring data from the API
   * @returns Observable with the sensor data tree
   */
  getHardwareData(): Observable<SensorNode> {
    return this.http.get<SensorNode>(this.hardwareApiUrl ).pipe(
      catchError(error => {
        console.error('Error fetching hardware data:', error);
        return of({ Children: [], ImageURL: '', Max: '', Min: '', Text: 'Error', Value: '', id: 0 });
      })
    );
  }
  
  /**
   * Gets a stream of hardware data that refreshes at the given interval
   * @param refreshInterval Time in milliseconds between refreshes
   * @returns Observable that emits updated hardware data at the specified interval
   */
  getHardwareDataStream(refreshInterval: number = 5000): Observable<SensorNode> {
    return timer(0, refreshInterval).pipe(
      switchMap(() => this.getHardwareData()),
      catchError(error => {
        console.error('Error in hardware data stream:', error);
        return of({ Children: [], ImageURL: '', Max: '', Min: '', Text: 'Error', Value: '', id: 0 });
      })
    );
  }
  
  /**
   * Finds a specific sensor by its ID in the sensor tree
   * @param sensorId The sensor ID to search for
   * @param data The sensor data tree to search in
   * @returns The found sensor node or undefined
   */
  findSensorById(sensorId: string, data: SensorNode): SensorNode | undefined {
    if (data.SensorId === sensorId) {
      return data;
    }
    
    if (data.Children) {
      for (const child of data.Children) {
        const found = this.findSensorById(sensorId, child);
        if (found) {
          return found;
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Gets sensors of a specific type from the data tree
   * @param type The sensor type to filter by (e.g., 'Temperature', 'Fan', 'Load')
   * @param data The sensor data tree to search in
   * @returns Array of sensor nodes matching the type
   */
  getSensorsByType(type: string, data: SensorNode): SensorNode[] {
    const results: SensorNode[] = [];
    
    if (data.Type === type) {
      results.push(data);
    }
    
    if (data.Children) {
      for (const child of data.Children) {
        results.push(...this.getSensorsByType(type, child));
      }
    }
    
    return results;
  }
  
  /**
   * Gets a specific hardware component by name
   * @param name The component name to search for
   * @param data The sensor data tree to search in
   * @returns The found component node or undefined
   */
  getComponentByName(name: string, data: SensorNode): SensorNode | undefined {
    if (data.Text === name) {
      return data;
    }
    
    if (data.Children) {
      for (const child of data.Children) {
        const found = this.getComponentByName(name, child);
        if (found) {
          return found;
        }
      }
    }
    
    return undefined;
  }

   /**
   * Fetches sound device data from the API
   * @returns Observable with an array of sound devices
   */
   getSoundDevices(): Observable<SoundDevice[]> {
    return this.http.get<SoundDevice[]>(this.soundApiUrl).pipe(
      catchError(error => {
        console.error('Error fetching sound device data:', error);
        return of([]);
      })
    );
  }

  /**
   * Gets a stream of sound device data that refreshes at the given interval
   * @param refreshInterval Time in milliseconds between refreshes
   * @returns Observable that emits updated sound device data at the specified interval
   */
  getSoundDevicesStream(refreshInterval: number = 5000): Observable<SoundDevice[]> {
    return timer(0, refreshInterval).pipe(
      switchMap(() => this.getSoundDevices()),
      catchError(error => {
        console.error('Error in sound device data stream:', error);
        return of([]);
      })
    );
  }

  /**
   * Filters sound devices by type (Playback or Recording)
   * @param type The device type to filter by ('Playback' or 'Recording')
   * @param devices The array of sound devices to filter
   * @returns Array of sound devices matching the specified type
   */
  getSoundDevicesByType(type: string, devices: SoundDevice[]): SoundDevice[] {
    return devices.filter(device => device.type === type);
  }

  /**
   * Gets the default sound device for a specific type
   * @param type The device type to find the default for ('Playback' or 'Recording')
   * @param devices The array of sound devices to search in
   * @returns The default sound device or undefined if not found
   */
  getDefaultSoundDevice(type: string, devices: SoundDevice[]): SoundDevice | undefined {
    return devices.find(device => device.type === type && device.default === 'true');
  }

  /**
   * Finds a sound device by its index
   * @param index The device index to search for
   * @param devices The array of sound devices to search in
   * @returns The found sound device or undefined
   */
  findSoundDeviceByIndex(index: string, devices: SoundDevice[]): SoundDevice | undefined {
    return devices.find(device => device.index === index);
  }
  
}