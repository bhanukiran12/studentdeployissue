import { useEffect, useState } from 'react';

import DashboardLayout from '../../components/DashboardLayout';
import api from '../../services/api';

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointmentForm, setAppointmentForm] = useState({ doctorId: '', date: '', reason: '' });
  const [recordForm, setRecordForm] = useState({ title: '', diseaseName: '', facedOn: '', notes: '', reportFile: null });
  const [message, setMessage] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const fetchData = async () => {
    setLoadingDoctors(true);
    try {
      const [doctorsRes, appointmentsRes, recordsRes, prescriptionsRes] = await Promise.all([
        api.get('/appointments/doctors'),
        api.get('/appointments'),
        api.get('/records'),
        api.get('/prescriptions')
      ]);

      setDoctors(doctorsRes.data.doctors || []);
      setAppointments(appointmentsRes.data.appointments || []);
      setRecords(recordsRes.data.records || []);
      setPrescriptions(prescriptionsRes.data.prescriptions || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to fetch patient data');
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const bookAppointment = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await api.post('/appointments', appointmentForm);
      setAppointmentForm({ doctorId: '', date: '', reason: '' });
      setMessage('Appointment booked successfully');
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not book appointment');
    }
  };

  const uploadRecord = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('title', recordForm.title);
      formData.append('diseaseName', recordForm.diseaseName);
      formData.append('facedOn', recordForm.facedOn);
      formData.append('notes', recordForm.notes);
      formData.append('reportFile', recordForm.reportFile);

      await api.post('/records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setRecordForm({ title: '', diseaseName: '', facedOn: '', notes: '', reportFile: null });
      setMessage('Medical history uploaded');
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to upload report');
    }
  };

  const deleteAppointment = async (appointmentId) => {
    setMessage('');

    try {
      await api.delete(`/appointments/${appointmentId}`);
      setMessage('Appointment deleted successfully');
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete appointment');
    }
  };

  const deleteRecord = async (recordId) => {
    setMessage('');

    try {
      await api.delete(`/records/${recordId}`);
      setMessage('Medical report deleted successfully');
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete medical report');
    }
  };

  const stats = [
    {
      label: 'Appointments',
      value: appointments.length,
      icon: '📅',
      bg: 'from-blue-500 to-sky-400',
      shadow: 'shadow-blue-400/40',
    },
    {
      label: 'Prescriptions',
      value: prescriptions.length,
      icon: '💊',
      bg: 'from-violet-500 to-purple-400',
      shadow: 'shadow-violet-400/40',
    },
    {
      label: 'Health Records',
      value: records.length,
      icon: '🗂️',
      bg: 'from-emerald-500 to-teal-400',
      shadow: 'shadow-emerald-400/40',
    },
    {
      label: 'Doctors Available',
      value: doctors.length,
      icon: '👨‍⚕️',
      bg: 'from-rose-500 to-pink-400',
      shadow: 'shadow-rose-400/40',
    },
  ];

  return (
    <DashboardLayout title="Patient Dashboard">

      {/* ── Toast message ── */}
      {message && (
        <div className="fade-in mb-5 flex items-center gap-3 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 px-5 py-3 text-sm font-semibold text-teal-700 shadow">
          <span className="text-lg">✅</span> {message}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="stagger mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon, bg, shadow }) => (
          <div key={label} className={`stat-card bg-gradient-to-br ${bg} shadow-xl ${shadow} fade-up`}>
            <p className="mb-1 text-3xl">{icon}</p>
            <p className="text-4xl font-extrabold tracking-tight">{value}</p>
            <p className="mt-1 text-sm font-semibold opacity-85">{label}</p>
          </div>
        ))}
      </div>
      {/* ── Action Forms ── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Book Appointment */}
        <section className="card fade-up border-t-4 border-blue-500">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl shadow-inner">📅</span>
            <div>
              <h3 className="text-lg font-bold text-blue-700">Book Appointment</h3>
              <p className="text-xs text-slate-400">Schedule a visit with a doctor</p>
            </div>
          </div>
          <form className="space-y-3" onSubmit={bookAppointment}>
            <select
              className="input"
              required
              value={appointmentForm.doctorId}
              onChange={(event) => setAppointmentForm((prev) => ({ ...prev, doctorId: event.target.value }))}
            >
              <option value="">
                {loadingDoctors ? 'Loading doctors...' : doctors.length === 0 ? 'No doctors available' : '👨‍⚕️ Select Doctor'}
              </option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} — {doctor.specialty || 'General'}
                </option>
              ))}
            </select>
            {!loadingDoctors && doctors.length === 0 && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-600">No doctors available yet.</p>
            )}
            <input
              className="input"
              required
              type="datetime-local"
              value={appointmentForm.date}
              onChange={(event) => setAppointmentForm((prev) => ({ ...prev, date: event.target.value }))}
            />
            <textarea
              className="input"
              placeholder="Reason for appointment…"
              required
              rows={3}
              value={appointmentForm.reason}
              onChange={(event) => setAppointmentForm((prev) => ({ ...prev, reason: event.target.value }))}
            />
            <button className="btn-primary w-full" type="submit">
              📅 Book Appointment
            </button>
          </form>
        </section>

        {/* Upload Health Record */}
        <section className="card fade-up border-t-4 border-emerald-500">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl shadow-inner">🗂️</span>
            <div>
              <h3 className="text-lg font-bold text-emerald-700">Upload Health Record</h3>
              <p className="text-xs text-slate-400">Add past disease history &amp; files</p>
            </div>
          </div>
          <form className="space-y-3" onSubmit={uploadRecord}>
            <input
              className="input"
              placeholder="Record title"
              required
              value={recordForm.title}
              onChange={(event) => setRecordForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <input
              className="input"
              placeholder="Disease / Condition (e.g. Diabetes)"
              value={recordForm.diseaseName}
              onChange={(event) => setRecordForm((prev) => ({ ...prev, diseaseName: event.target.value }))}
            />
            <input
              className="input"
              type="date"
              value={recordForm.facedOn}
              onChange={(event) => setRecordForm((prev) => ({ ...prev, facedOn: event.target.value }))}
            />
            <textarea
              className="input"
              placeholder="Symptoms, treatment details…"
              rows={3}
              value={recordForm.notes}
              onChange={(event) => setRecordForm((prev) => ({ ...prev, notes: event.target.value }))}
            />
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100">
              <span>📎</span>
              <span>{recordForm.reportFile ? recordForm.reportFile.name : 'Choose file to upload'}</span>
              <input
                className="hidden"
                required
                type="file"
                onChange={(event) => setRecordForm((prev) => ({ ...prev, reportFile: event.target.files[0] }))}
              />
            </label>
            <button className="btn-primary w-full" type="submit">
              ⬆️ Upload History
            </button>
          </form>
        </section>
      </div>

      {/* ── Appointments & Prescriptions ── */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">

        <section className="card fade-up lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-lg">📋</span>
              <h3 className="text-lg font-bold text-sky-700">My Appointments</h3>
            </div>
            <span className="tag tag-info">{appointments.length} total</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {appointments.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                <span className="text-4xl">📭</span>
                <p className="text-sm">No appointments yet</p>
              </div>
            )}
            {appointments.map((appointment, i) => (
              <div
                key={appointment._id}
                className="slide-in group rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-sky-50/40 p-4 text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-800">👨‍⚕️ {appointment.doctor?.name || 'Doctor'}</p>
                    <p className="mt-0.5 text-slate-500">🗓 {new Date(appointment.date).toLocaleString()}</p>
                    <p className="mt-0.5 text-slate-600">💬 {appointment.reason}</p>
                  </div>
                  <span className={`tag shrink-0 ${appointment.status === 'completed' ? 'tag-success' : appointment.status === 'cancelled' ? 'tag-danger' : 'tag-info'}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="mt-3">
                  <button className="btn-danger" type="button" onClick={() => deleteAppointment(appointment._id)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card fade-up">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-lg">💊</span>
            <h3 className="text-lg font-bold text-violet-700">Prescriptions</h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {prescriptions.length === 0 && (
              <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 text-sm shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">📭</span>
                  <p className="font-bold text-violet-700">No prescriptions yet</p>
                </div>
                <p className="mb-3 text-slate-600">After your consultation, your doctor will add medicines here.</p>
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-violet-100">1. Book an appointment with a doctor.</p>
                  <p className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-violet-100">2. Upload your old health records for better diagnosis.</p>
                  <p className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-violet-100">3. Check back here after the consultation.</p>
                </div>
                <p className="mt-3 text-xs font-medium text-violet-700">Tip: Keep reports updated to receive precise prescriptions.</p>
              </div>
            )}
            {prescriptions.map((prescription, i) => (
              <div
                key={prescription._id}
                className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-4 text-sm shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <p className="font-bold text-violet-800">💊 {prescription.medication}</p>
                <p className="mt-1 text-slate-600">Dosage: <span className="font-semibold">{prescription.dosage}</span></p>
                <p className="text-slate-500">{prescription.instructions}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Medical Reports ── */}
      <section className="card fade-up mt-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-lg">🗂️</span>
            <h3 className="text-lg font-bold text-emerald-700">My Medical Reports</h3>
          </div>
          <span className="tag tag-success">{records.length} uploaded</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {records.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 py-8 text-slate-400">
              <span className="text-4xl">📁</span>
              <p className="text-sm">No reports uploaded yet</p>
            </div>
          )}
          {records.map((record, i) => (
            <div
              key={record._id}
              className="fade-up group rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-4 text-sm shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <a
                className="block font-bold text-emerald-700 hover:underline"
                href={`http://localhost:5000${record.filePath}`}
                rel="noreferrer"
                target="_blank"
              >
                📄 {record.title}
              </a>
              {record.diseaseName && (
                <p className="mt-2">
                  <span className="tag tag-warning">🦠 {record.diseaseName}</span>
                </p>
              )}
              {record.facedOn && (
                <p className="mt-1 text-slate-500">📆 {new Date(record.facedOn).toLocaleDateString()}</p>
              )}
              <p className="mt-1 text-slate-500">{record.notes || 'No notes'}</p>
              <div className="mt-3">
                <button className="btn-danger" type="button" onClick={() => deleteRecord(record._id)}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Health Guidance ── */}
      <div className="mt-7">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 text-xl text-white shadow-lg shadow-teal-300/40">🌿</span>
          <div>
            <h2 className="text-xl font-extrabold text-secondary">Health Guidance &amp; Wellness</h2>
            <p className="text-xs text-slate-400">Tips, rules &amp; first aid — always be prepared</p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Health Tips */}
          <section className="card fade-up border-t-4 border-teal-400">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-xl shadow-inner">💡</span>
              <h3 className="text-base font-extrabold text-teal-700">Daily Health Tips</h3>
            </div>
            <ul className="space-y-1.5">
              {[
                ['💧', 'Drink 8–10 glasses of water every day to stay hydrated.'],
                ['🥦', 'Eat a balanced diet with fruits, vegetables, proteins, and whole grains.'],
                ['🏃', 'Exercise at least 30 minutes daily — even a brisk walk counts.'],
                ['😴', 'Get 7–9 hours of quality sleep each night.'],
                ['🚭', 'Avoid smoking, tobacco, and limit alcohol consumption.'],
                ['🧘', 'Practice stress management — meditation or deep breathing helps.'],
                ['🩺', 'Schedule regular health check-ups even when feeling well.'],
                ['🧴', 'Wash hands frequently to prevent infection and illness.'],
              ].map(([icon, tip]) => (
                <li key={tip} className="health-tip">
                  <span className="shrink-0 text-base">{icon}</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Rules & Regulations */}
          <section className="card fade-up border-t-4 border-blue-400">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-xl shadow-inner">📋</span>
              <h3 className="text-base font-extrabold text-blue-700">Rules &amp; Healthy Steps</h3>
            </div>
            <ol className="space-y-1.5">
              {[
                'Always inform your doctor about all medications you are currently taking.',
                "Never self-medicate with prescription drugs without a doctor's advice.",
                'Complete the full course of antibiotics even if you feel better.',
                'Keep a record of your blood pressure, blood sugar if you have chronic conditions.',
                'Avoid sharing personal medical equipment (glucometers, inhalers).',
                'Wear a mask in crowded or high-risk environments to prevent infection spread.',
                'Follow post-surgery or post-treatment care instructions strictly.',
                'Bring your prescription and medical records to every hospital visit.',
              ].map((rule, i) => (
                <li key={i} className="rule-item">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-sky-400 text-xs font-extrabold text-white shadow">{i + 1}</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* First Aid */}
          <section className="card fade-up border-t-4 border-rose-400">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-xl shadow-inner">🚑</span>
              <h3 className="text-base font-extrabold text-rose-700">First Aid Quick Guide</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { title: '🩸 Bleeding / Cut',       steps: ['Apply firm pressure with a clean cloth.', 'Elevate the injured area above heart level.', 'Seek help if bleeding > 10 min.'],                       color: 'bg-rose-50   border-rose-200' },
                { title: '🔥 Burns',                 steps: ['Cool with running water for 10–20 min.', 'Do NOT use ice, butter, or toothpaste.', 'Cover loosely with sterile bandage.'],                       color: 'bg-orange-50 border-orange-200' },
                { title: '💔 Cardiac Arrest (CPR)', steps: ['Call emergency services (112 / 108) immediately.', '100–120 chest compressions/min.', 'Use AED if available.'],                                  color: 'bg-red-50    border-red-200' },
                { title: '🤢 Choking',               steps: ['Encourage forceful coughing.', '5 back blows between shoulder blades.', 'Abdominal thrusts (Heimlich) if needed.'],                            color: 'bg-amber-50  border-amber-200' },
                { title: '🥵 Heat Stroke',           steps: ['Move to cool/shaded area immediately.', 'Apply ice packs to neck, armpits, groin.', 'Call emergency — no fluids if unconscious.'],              color: 'bg-yellow-50 border-yellow-200' },
                { title: '🧠 Seizure',               steps: ['Remove hard/sharp objects nearby.', 'Do NOT restrain or put anything in mouth.', 'Call help if seizure lasts > 5 minutes.'],                    color: 'bg-purple-50 border-purple-200' },
              ].map(({ title, steps, color }) => (
                <div key={title} className={`aid-card border ${color}`}>
                  <p className="mb-1 font-bold text-slate-800">{title}</p>
                  <ol className="list-inside list-decimal space-y-0.5 pl-1 text-xs text-slate-600">
                    {steps.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Emergency numbers */}
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-pink-600 p-5 shadow-xl shadow-rose-300/30">
          <span className="text-base font-extrabold text-white">🆘 Emergency Contacts:</span>
          {[
            ['🚑 Ambulance', '108'],
            ['🚒 Fire', '101'],
            ['🚔 Police', '100'],
            ['☎️ Disaster', '1078'],
            ['🏥 Health Helpline', '1800-180-1104'],
          ].map(([label, num]) => (
            <span key={num} className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/30 hover:scale-105 cursor-default">
              {label} — <strong>{num}</strong>
            </span>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
