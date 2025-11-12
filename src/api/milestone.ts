import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type { Milestone } from "../types/milestone";

export const getMilestones = (projectId: Id) =>
  api
    .get<ApiEnvelope<Milestone[]>>(`/projects/${projectId}/milestones`)
    .then((r) => r.data);
