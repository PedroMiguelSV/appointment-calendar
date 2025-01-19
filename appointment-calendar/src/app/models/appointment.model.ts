export interface AppointmentModel {
  appointment_id: number;
  client_id: number;
  client_name: string;
  client_phone: string;
  services: number[];
  service_ids: string;
  date: string;
  startTime: string;
  endTime: string;
  note: string;
}
