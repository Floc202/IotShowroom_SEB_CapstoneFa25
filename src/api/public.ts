import api from "./axios";
import type { ApiEnvelope } from "../types/base";

export interface PublicStatistics {
  totalProjects: number;
  activeClasses: number;
  liveDemos: number;
  connectedDevices: number;
}

export const getPublicStatistics = () => {
  return api.get<ApiEnvelope<PublicStatistics>>("/public/statistics");
};
