import type { HostawayClient } from '../client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  CreateTaskRequest,
  Task,
  TasksListParams,
  UpdateTaskRequest,
} from '../types/tasks.js';

const encodePathParam = (value: number | string): string =>
  encodeURIComponent(String(value));

export class TasksResource {
  private client: HostawayClient;

  constructor(client: HostawayClient) {
    this.client = client;
  }

  list(params?: TasksListParams): Promise<ApiResponse<Task[]>> {
    return this.client.request('GET', '/tasks', { query: params });
  }

  get(taskId: number | string): Promise<ApiResponse<Task>> {
    return this.client.request('GET', `/tasks/${encodePathParam(taskId)}`);
  }

  create(payload: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return this.client.request('POST', '/tasks', { body: payload });
  }

  update(
    taskId: number | string,
    payload: UpdateTaskRequest
  ): Promise<ApiResponse<Task>> {
    return this.client.request('PUT', `/tasks/${encodePathParam(taskId)}`, {
      body: payload,
    });
  }

  delete(taskId: number | string): Promise<ApiResponse<unknown> | undefined> {
    return this.client.request('DELETE', `/tasks/${encodePathParam(taskId)}`);
  }
}
