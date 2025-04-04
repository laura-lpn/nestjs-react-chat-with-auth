import axios from "axios";
import { authService } from "./authService";

const API_URL = "http://localhost:8000/api/messages";

export interface Message {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    id: string;
    email: string;
  };
  likedBy: {
    id: string;
    email: string;
  }[];
}

export interface CreateMessageDto {
  text: string;
}

export interface UpdateMessageDto {
  text: string;
}

export const messageService = {
  async create(data: CreateMessageDto): Promise<Message> {
    const token = authService.getToken();
    const response = await axios.post(API_URL, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async findAll(): Promise<Message[]> {
    const response = await axios.get(API_URL);
    return response.data;
  },

  async findOne(id: string): Promise<Message> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async update(id: string, data: CreateMessageDto): Promise<Message> {
    const token = authService.getToken();
    const response = await axios.patch(`${API_URL}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async toggleLikeMessage(messageId: string): Promise<Message> {
    const token = authService.getToken();
    const response = await axios.patch(
      `${API_URL}/${messageId}/like`, 
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async remove(id: string): Promise<void> {
    const token = authService.getToken();
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
