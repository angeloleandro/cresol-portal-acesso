// Configurações para os componentes genéricos Management
// Define diferentes contextos: admin/sector vs admin-subsetor/subsector

import type { EventConfig } from '../EventsManagement';
import type { NewsConfig } from '../NewsManagement';

export const SECTOR_NEWS_CONFIG: NewsConfig = {
  entityType: 'sector',
  apiEndpoint: '/api/admin/sector-content',
  entityIdField: 'sectorId',
  useAlerts: false,
  requestStructure: 'admin'
};

export const SUBSECTOR_NEWS_CONFIG: NewsConfig = {
  entityType: 'subsector',
  apiEndpoint: '/api/admin/subsector-content',
  entityIdField: 'subsectorId',
  useAlerts: true,
  requestStructure: 'subsector'
};

export const SECTOR_EVENTS_CONFIG: EventConfig = {
  entityType: 'sector',
  apiEndpoint: '/api/admin/sector-content',
  entityIdField: 'sectorId',
  useAlerts: true,
  requestStructure: 'admin'
};

export const SUBSECTOR_EVENTS_CONFIG: EventConfig = {
  entityType: 'subsector',
  apiEndpoint: '/api/admin/subsector-content',
  entityIdField: 'subsectorId',
  useAlerts: true,
  requestStructure: 'subsector'
};