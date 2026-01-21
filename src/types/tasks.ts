import type { ISODateTimeString, ListParams } from './common.js';

export interface TasksListParams extends Pick<ListParams, 'limit' | 'offset'> {
  channelId?: number | string;
  canStartFromEvent?: string;
  shouldEndByEvent?: string;
  reservationId?: number | string;
  match?: string;
  status?: TaskStatus;
  canStartFromStart?: ISODateTimeString | string;
  canStartFromEnd?: ISODateTimeString | string;
  shouldEndByStart?: ISODateTimeString | string;
  shouldEndByEnd?: ISODateTimeString | string;
}

export type TaskStatus =
  | 'pending'
  | 'confirmed'
  | 'inProgress'
  | 'completed'
  | 'cancelled'
  | string;

export interface Task {
  id?: number;
  listingMapId?: number;
  channelId?: number;
  reservationId?: number;
  autoTaskId?: number;
  assigneeUserId?: number;
  canBePickedByGroupId?: number;
  supervisorUserId?: number;
  createdByUserId?: number;
  isUpdatedManually?: number | boolean;
  checklistTemplateId?: number;
  reservationUnitId?: number;
  title?: string;
  description?: string | null;
  canStartFrom?: ISODateTimeString | string;
  canStartFromListingTime?: ISODateTimeString | string;
  canStartFromEvent?: string;
  canStartFromEventDelta?: number;
  shouldEndBy?: ISODateTimeString | string;
  shouldEndByListingTime?: ISODateTimeString | string;
  shouldEndByEvent?: string;
  shouldEndByEventDelta?: number;
  status?: TaskStatus;
  resolutionNote?: string | null;
  feedbackScore?: number | null;
  feedbackNote?: string | null;
  startedAt?: ISODateTimeString | string | null;
  confirmedAt?: ISODateTimeString | string | null;
  completedAt?: ISODateTimeString | string | null;
  priority?: number | null;
  cost?: number | null;
  costCurrency?: string | null;
  costDescription?: string | null;
  color?: string | null;
  expense?: unknown[] | null;
  rank?: number | null;
  checklistItems?: unknown[] | null;
  customFieldValue?: unknown[] | null;
  categoriesMap?: unknown;
  [key: string]: unknown;
}

export interface CreateTaskRequest {
  title: string;
  listingMapId?: number | string;
  channelId?: number | string;
  reservationId?: number | string;
  autoTaskId?: number | string;
  assigneeUserId?: number | string;
  canBePickedByGroupId?: number | string;
  supervisorUserId?: number | string;
  checklistTemplateId?: number | string;
  reservationUnitId?: number | string;
  description?: string | null;
  canStartFrom?: ISODateTimeString | string;
  canStartFromListingTime?: ISODateTimeString | string;
  canStartFromEvent?: string;
  canStartFromEventDelta?: number;
  shouldEndBy?: ISODateTimeString | string;
  shouldEndByListingTime?: ISODateTimeString | string;
  shouldEndByEvent?: string;
  shouldEndByEventDelta?: number;
  status?: TaskStatus;
  resolutionNote?: string | null;
  feedbackScore?: number | null;
  feedbackNote?: string | null;
  priority?: number | null;
  cost?: number | null;
  costCurrency?: string | null;
  costDescription?: string | null;
  color?: string | null;
  expense?: unknown[] | null;
  rank?: number | null;
  checklistItems?: unknown[] | null;
  customFieldValue?: unknown[] | null;
  categoriesMap?: unknown;
  [key: string]: unknown;
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>;
