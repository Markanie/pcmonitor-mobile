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

@Injectable({
  providedIn: 'root'
})
export class PcmonitorapiService {
  private apiUrl = '/api/hardware/';
  
  constructor(private http: HttpClient) { }
  
  /**
   * Fetches hardware monitoring data from the API
   * @returns Observable with the sensor data tree
   */
  getHardwareData(): Observable<SensorNode> {
    return this.http.get<SensorNode>(this.apiUrl).pipe(
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
}