import axios, { AxiosInstance } from 'axios';
import { 
  ApiLog, 
  OverviewData, 
  TimeSeriesPoint, 
  EndpointStats, 
  TokenStats, 
  AuthResponse, 
  LoginRequest,
  FilterOptions 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentification
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  }

  async register(userData: { email: string; password: string; displayName: string; role: 'Admin' | 'Viewer' }): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/register', userData);
    return response.data;
  }

  // Analytics
  async getOverview(): Promise<OverviewData> {
    const response = await this.api.get<OverviewData>('/api/analytics/overview');
    return response.data;
  }

  async getTimeSeries(points: number = 24, interval: string = 'hour'): Promise<TimeSeriesPoint[]> {
    const response = await this.api.get<TimeSeriesPoint[]>(`/api/analytics/timeseries?points=${points}&interval=${interval}`);
    return response.data;
  }

  async getTopEndpoints(top: number = 10): Promise<EndpointStats[]> {
    const response = await this.api.get<EndpointStats[]>(`/api/analytics/topendpoints?top=${top}`);
    return response.data;
  }

  async getTokenStats(): Promise<TokenStats[]> {
    const response = await this.api.get<TokenStats[]>('/api/analytics/tokens');
    return response.data;
  }

  // Logs
  async getLogs(filters: FilterOptions = {}, page: number = 1, pageSize: number = 50): Promise<ApiLog[]> {
    const params = new URLSearchParams();
    
    if (filters.method) params.append('method', filters.method);
    if (filters.statusCode) params.append('statusCode', filters.statusCode.toString());
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.path) params.append('path', filters.path);
    
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    const response = await this.api.get<ApiLog[]>(`/api/logs?${params}`);
    return response.data;
  }

  async exportCsv(filters: FilterOptions = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters.method) params.append('method', filters.method);
    if (filters.statusCode) params.append('statusCode', filters.statusCode.toString());
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);

    const response = await this.api.get(`/api/logs/export/csv?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async purgeLogs(daysToKeep?: number): Promise<void> {
    const params = daysToKeep ? `?daysToKeep=${daysToKeep}` : '';
    await this.api.delete(`/api/logs/purge${params}`);
  }

  // Tokens
  async getTokenSummary(): Promise<any> {
    const response = await this.api.get('/api/tokens/summary');
    return response.data;
  }

  async getSuspiciousTokens(): Promise<TokenStats[]> {
    const response = await this.api.get<TokenStats[]>('/api/tokens/suspicious');
    return response.data;
  }

  async getExpiredTokens(daysInactive: number = 30): Promise<TokenStats[]> {
    const response = await this.api.get<TokenStats[]>(`/api/tokens/expired?daysInactive=${daysInactive}`);
    return response.data;
  }

  // Survey API methods
  async getSurveys(): Promise<any[]> {
    const response = await this.api.get('/api/survey');
    return response.data;
  }

  async getSurvey(id: number): Promise<any> {
    const response = await this.api.get(`/api/survey/${id}`);
    return response.data;
  }

  async createSurvey(surveyData: {
    title: string;
    opcode: string;
    description?: string;
    status?: string;
  }): Promise<any> {
    const response = await this.api.post('/api/survey', surveyData);
    return response.data;
  }

  async updateSurvey(id: number, surveyData: {
    title?: string;
    description?: string;
    status?: string;
  }): Promise<any> {
    const response = await this.api.put(`/api/survey/${id}`, surveyData);
    return response.data;
  }

  async deleteSurvey(id: number): Promise<void> {
    await this.api.delete(`/api/survey/${id}`);
  }

  async getSurveyResponses(id: number): Promise<any[]> {
    const response = await this.api.get(`/api/survey/${id}/responses`);
    return response.data;
  }

  async createSurveyResponse(surveyId: number, responseData: {
    responseId: string;
    respondentId?: string;
    respondentEmail?: string;
    responseData: string;
  }): Promise<any> {
    const response = await this.api.post(`/api/survey/${surveyId}/responses`, responseData);
    return response.data;
  }

  async getSurveyAnalytics(): Promise<any> {
    const response = await this.api.get('/api/survey/analytics/overview');
    return response.data;
  }

  async getAtreemoStatus(): Promise<any> {
    const response = await this.api.get('/api/survey/atreemo/status');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
