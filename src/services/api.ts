import axios, { AxiosResponse } from 'axios';
import {
  PaperGenerationRequest,
  PaperGenerationResponse,
  AnswerKeyRequest,
  AnswerKeyResponse,
  ReplaceQuestionRequest,
  ReplaceQuestionResponse,
  HealthResponse,
  ErrorResponse,
} from '../types/api';
import { API_CONFIG } from '../constants';

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const generatePaper = async (paperConfig: PaperGenerationRequest): Promise<PaperGenerationResponse> => {
  try {
    console.log('API: Sending request to generate paper:', paperConfig);
    const response: AxiosResponse<PaperGenerationResponse> = await api.post('/generate-paper', paperConfig);
    console.log('API: Received response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API: Error generating paper:', error);
    console.error('API: Error response:', error.response?.data);
    console.error('API: Error status:', error.response?.status);
    
    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      throw new Error('Request timed out. The AI is taking longer than expected to generate the paper. Please try again with a simpler configuration or check your internet connection.');
    }
    
    // Handle validation errors (422)
    if (error.response?.status === 422) {
      const details = error.response?.data?.detail;
      if (Array.isArray(details)) {
        const errorMessages = details.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
        throw new Error(`Validation Error: ${errorMessages}`);
      } else if (typeof details === 'string') {
        throw new Error(`Validation Error: ${details}`);
      }
    }
    
    // Handle server errors (500)
    if (error.response?.status === 500) {
      throw new Error('Server error occurred while generating the paper. Please try again later.');
    }
    
    // Handle network errors
    if (!error.response) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    throw new Error(error.response?.data?.detail || error.message || 'Failed to generate paper');
  }
};

export const generateAnswerKey = async (paperId: string): Promise<AnswerKeyResponse> => {
  try {
    console.log('API: Generating answer key for paper:', paperId);
    const response: AxiosResponse<AnswerKeyResponse> = await api.post('/generate-answers', { 
      paper_id: paperId 
    });
    console.log('API: Answer key generated:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API: Error generating answer key:', error);
    console.error('API: Error response:', error.response?.data);
    console.error('API: Error status:', error.response?.status);
    
    // Handle validation errors (422)
    if (error.response?.status === 422) {
      const details = error.response?.data?.detail;
      if (Array.isArray(details)) {
        const errorMessages = details.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
        throw new Error(`Validation Error: ${errorMessages}`);
      } else if (typeof details === 'string') {
        throw new Error(`Validation Error: ${details}`);
      }
    }
    
    throw new Error(error.response?.data?.detail || error.message || 'Failed to generate answer key');
  }
};

export const replaceQuestion = async (
  paperId: string,
  sectionIndex: number,
  questionIndex: number,
  questionText: string
): Promise<ReplaceQuestionResponse> => {
  try {
    const response: AxiosResponse<ReplaceQuestionResponse> = await api.post('/replace-question', {
      paper_id: paperId,
      section_index: sectionIndex,
      question_index: questionIndex,
      question_text: questionText,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to replace question');
  }
};

export const getPaper = async (paperId: string): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await api.get(`/paper/${paperId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch paper');
  }
};

export const listPapers = async (): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await api.get('/papers');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to list papers');
  }
};

export const getBoards = async (): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await api.get('/boards');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch boards');
  }
};

export const getSubjects = async (): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await api.get('/subjects');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch subjects');
  }
};

export const getQuestionTypes = async (): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await api.get('/question-types');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch question types');
  }
};

export const healthCheck = async (): Promise<HealthResponse> => {
  try {
    const response: AxiosResponse<HealthResponse> = await api.get('/health');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'API is not available');
  }
};

export default api;
