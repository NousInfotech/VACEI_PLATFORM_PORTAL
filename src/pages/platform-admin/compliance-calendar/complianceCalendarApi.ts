import { apiGet, apiPost, apiPatch, apiDelete } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type {
  ComplianceCalendarListParams,
  ComplianceCalendarListResponse,
  ComplianceCalendarSingleResponse,
  ComplianceCalendarMessageResponse,
  CreateComplianceCalendarBody,
  UpdateComplianceCalendarBody,
} from '../../../types/compliance-calendar';

export function listComplianceCalendars(
  params?: ComplianceCalendarListParams
): Promise<ComplianceCalendarListResponse> {
  return apiGet<ComplianceCalendarListResponse>(endPoints.COMPLIANCE_CALENDAR.LIST, params as Record<string, unknown>);
}

export function getComplianceCalendar(id: string): Promise<ComplianceCalendarSingleResponse> {
  return apiGet<ComplianceCalendarSingleResponse>(endPoints.COMPLIANCE_CALENDAR.GET_BY_ID(id));
}

export function createComplianceCalendar(
  body: CreateComplianceCalendarBody
): Promise<ComplianceCalendarSingleResponse> {
  return apiPost<ComplianceCalendarSingleResponse>(endPoints.COMPLIANCE_CALENDAR.CREATE, body as unknown as Record<string, unknown>);
}

export function updateComplianceCalendar(
  id: string,
  body: UpdateComplianceCalendarBody
): Promise<ComplianceCalendarSingleResponse> {
  return apiPatch<ComplianceCalendarSingleResponse>(endPoints.COMPLIANCE_CALENDAR.UPDATE(id), body as Record<string, unknown>);
}

export function deleteComplianceCalendar(id: string): Promise<ComplianceCalendarMessageResponse> {
  return apiDelete<ComplianceCalendarMessageResponse>(endPoints.COMPLIANCE_CALENDAR.DELETE(id));
}
