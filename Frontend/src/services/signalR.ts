import * as signalR from '@microsoft/signalr';
import { OverviewData, ApiLog } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private onOverviewUpdate: ((data: OverviewData) => void) | null = null;
  private onLogReceived: ((log: ApiLog) => void) | null = null;

  async startConnection(): Promise<void> {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/hubs/logs`)
        .withAutomaticReconnect()
        .build();

      // Configuration des événements
      this.connection.on('AnalyticsUpdated', (data: OverviewData) => {
        if (this.onOverviewUpdate) {
          this.onOverviewUpdate(data);
        }
      });

      this.connection.on('ReceiveLog', (log: ApiLog) => {
        if (this.onLogReceived) {
          this.onLogReceived(log);
        }
      });

      await this.connection.start();
      console.log('SignalR Connected');
    } catch (error) {
      console.error('SignalR Connection Error:', error);
      throw error;
    }
  }

  setOnOverviewUpdate(callback: (data: OverviewData) => void): void {
    this.onOverviewUpdate = callback;
  }

  setOnLogReceived(callback: (log: ApiLog) => void): void {
    this.onLogReceived = callback;
  }

  async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  getConnectionState(): string {
    if (!this.connection) return 'Disconnected';
    return this.connection.state;
  }
}

export const signalRService = new SignalRService();
export default signalRService;
