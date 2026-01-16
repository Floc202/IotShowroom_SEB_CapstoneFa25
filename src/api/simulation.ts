import axios from "./axios";
import type { ApiEnvelope } from "../types/base";

export interface SimulationItem {
  simulationId: number;
  projectId: number;
  projectTitle: string;
  groupName: string;
  title: string;
  description: string;
  status: "draft" | "submitted" | "graded";
  wokwiProjectUrl: string;
  wokwiProjectId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateSimulationDto {
  projectId: number;
  title: string;
  description: string;
  wokwiProjectUrl: string;
  wokwiProjectId: string;
}

export interface UpdateSimulationDto {
  title: string;
  description: string;
  wokwiProjectUrl: string;
  wokwiProjectId: string;
}

export interface UpdateSimulationStatusDto {
  status: "draft" | "submitted" | "graded";
}

export const createSimulation = (data: CreateSimulationDto) =>
  axios.post<ApiEnvelope<SimulationItem>>("/Simulation", data);

export const updateSimulation = (simulationId: number, data: UpdateSimulationDto) =>
  axios.put<ApiEnvelope<SimulationItem>>(`/Simulation/${simulationId}`, data);

export const deleteSimulation = (simulationId: number) =>
  axios.delete<ApiEnvelope<void>>(`/Simulation/${simulationId}`);

export const getSimulationsByProject = (projectId: number) =>
  axios.get<ApiEnvelope<SimulationItem[]>>(`/Simulation/project/${projectId}`);

export const updateSimulationStatus = (simulationId: number, data: UpdateSimulationStatusDto) =>
  axios.patch<ApiEnvelope<SimulationItem>>(`/Simulation/${simulationId}/status`, data);
