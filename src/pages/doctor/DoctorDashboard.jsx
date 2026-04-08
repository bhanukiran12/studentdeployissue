import { useEffect, useState } from 'react';

import DashboardLayout from '../../components/DashboardLayout';
import api from '../../services/api';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientHistory, setPatientHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [form, setForm] = useState({ patientId: '', medication: '', dosage: '', instructions: '' });
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [patientsRes, appointmentsRes] = await Promise.all([api.get('/doctor/all-patients'), api.get('/appointments')]);
      setPatients(patientsRes.data.patients || []);
      setAppointments(appointmentsRes.data.appointments || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to fetch doctor data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      if (!selectedPatientId) {
        setPatientHistory([]);
        return;
      }

      setHistoryLoading(true);
      try {
        const response = await api.get(`/records?patientId=${selectedPatientId}`);
        setPatientHistory(response.data.records || []);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to fetch patient history');
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchPatientHistory();
  }, [selectedPatientId]);

  const handleCreatePrescription = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await api.post('/prescriptions', form);
      setForm({ patientId: '', medication: '', dosage: '', instructions: '' });
      setMessage('Prescription created successfully');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create prescription');
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status });
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <DashboardLayout title="Doctor Dashboard">
      {message && <p className="mb-4 rounded-lg bg-sky-50 p-3 text-sm font-medium text-sky-700">{message}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <h3 className="mb-4 text-lg font-semibold text-secondary">Create Prescription</h3>
          <form className="space-y-3" onSubmit={handleCreatePrescription}>
            <select
              className="input"
              required
              value={form.patientId}
              onChange={(event) => setForm((prev) => ({ ...prev, patientId: event.target.value }))}
            >
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Medication"
              required
              value={form.medication}
              onChange={(event) => setForm((prev) => ({ ...prev, medication: event.target.value }))}
            />
            <input
              className="input"
              placeholder="Dosage"
              required
              value={form.dosage}
              onChange={(event) => setForm((prev) => ({ ...prev, dosage: event.target.value }))}
            />
            <textarea
              className="input"
              placeholder="Instructions"
              required
              rows={3}
              value={form.instructions}
              onChange={(event) => setForm((prev) => ({ ...prev, instructions: event.target.value }))}
            />
            <button className="btn-primary" type="submit">
              Save Prescription
            </button>
          </form>
        </section>

        <section className="card">
          <h3 className="mb-3 text-lg font-semibold text-secondary">My Patients</h3>
          <div className="space-y-2">
            {patients.length === 0 && <p className="text-sm text-slate-500">No patients found.</p>}
            {patients.map((patient) => (
              <div key={patient._id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <p className="font-semibold text-slate-700">{patient.name}</p>
                <p>{patient.email}</p>
                <p>{patient.phone || 'No phone'}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card mt-4">
        <h3 className="mb-3 text-lg font-semibold text-secondary">Appointments</h3>
        <div className="space-y-2">
          {appointments.length === 0 && <p className="text-sm text-slate-500">No appointments assigned.</p>}
          {appointments.map((appointment) => (
            <div key={appointment._id} className="rounded-xl border border-slate-200 p-3 text-sm sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-700">{appointment.patient?.name}</p>
                <p>{new Date(appointment.date).toLocaleString()}</p>
                <p>{appointment.reason}</p>
                <p className="font-medium">
                  Status:{' '}
                  <span
                    className={`tag ${
                      appointment.status === 'completed'
                        ? 'tag-success'
                        : appointment.status === 'cancelled'
                          ? 'tag-danger'
                          : 'tag-warning'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </p>
              </div>
              <div className="mt-3 flex gap-2 sm:mt-0">
                <button className="btn-success" onClick={() => updateStatus(appointment._id, 'completed')}>
                  Mark Completed
                </button>
                <button className="btn-danger" onClick={() => updateStatus(appointment._id, 'cancelled')}>
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-4">
        <h3 className="mb-3 text-lg font-semibold text-secondary">Patient Old Health History</h3>
        <div className="mb-3 grid gap-3 sm:max-w-md">
          <select className="input" value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>
            <option value="">Select patient to view history</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>

        {historyLoading && <p className="text-sm text-slate-500">Loading history...</p>}
        {!historyLoading && selectedPatientId && patientHistory.length === 0 && (
          <p className="text-sm text-slate-500">No old records uploaded by this patient.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {patientHistory.map((record) => {
            const fileUrl = `http://localhost:5000${record.filePath}`;
            const isImage = /\.(png|jpg|jpeg|webp|gif)$/i.test(record.filePath);

            return (
              <div key={record._id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <p className="font-semibold text-slate-700">{record.title}</p>
                {record.diseaseName && <p>Disease: {record.diseaseName}</p>}
                {record.facedOn && <p>Faced On: {new Date(record.facedOn).toLocaleDateString()}</p>}
                <p className="mt-1">{record.notes || 'No notes shared'}</p>
                {isImage ? (
                  <a className="mt-2 inline-block text-primary hover:underline" href={fileUrl} rel="noreferrer" target="_blank">
                    View disease image
                  </a>
                ) : (
                  <a className="mt-2 inline-block text-primary hover:underline" href={fileUrl} rel="noreferrer" target="_blank">
                    Open medical file
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
