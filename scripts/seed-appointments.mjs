const BASE = process.env.API_URL || "http://localhost:3000";

const appointments = [
  { doctorName: "Dr. Gaurav Bhargava", timeSlot: "11:40 AM - 11:50 AM", location: "किदवई नगर शाखा", patientName: "Akash jain", fee: 400, appointmentId: "MR5VMQVRRZ", timestamp: "2026-07-04 10:13:55", phone: "" },
  { doctorName: "Dr. Priyanka Bhargava", timeSlot: "05:20 PM - 05:30 PM", location: "स्वरूप नगर शाखा", patientName: "Priyam narain", fee: 1000, appointmentId: "MRDBNHW9JR", timestamp: "2026-07-09 15:17:20", phone: "" },
  { doctorName: "Dr. Gaurav Bhargava", timeSlot: "10:40 AM - 10:50 AM", location: "किदवई नगर शाखा", patientName: "Uddhav Bhalla", fee: 400, appointmentId: "MRHA0UH6JO", timestamp: "2026-07-12 09:43:03", phone: "9839915747" },
  { doctorName: "Dr. Priyanka Bhargava", timeSlot: "11:20 AM - 11:30 AM", location: "किदवई नगर शाखा", patientName: "Rukhsana bano", fee: 500, appointmentId: "MRJZER6CNY", timestamp: "2026-07-14 07:08:48", phone: "6392166094" },
  { doctorName: "Dr. Gaurav Bhargava", timeSlot: "05:40 PM - 05:50 PM", location: "स्वरूप नगर शाखा", patientName: "Shashi Tiwari", fee: 1000, appointmentId: "MRLMN0099F", timestamp: "2026-07-15 10:48:34", phone: "8090026087" },
  { doctorName: "Dr. Gaurav Bhargava", timeSlot: "11:10 AM - 11:20 AM", location: "किदवई नगर शाखा", patientName: "Ankur Gupta", fee: 400, appointmentId: "", timestamp: "2026-07-17 10:10:00", phone: "7905435212" },
  { doctorName: "Dr. Priyanka Bhargava", timeSlot: "01:00 PM - 01:10 PM", location: "किदवई नगर शाखा", patientName: "Suman Kushwaha", fee: 500, appointmentId: "", timestamp: "2026-07-17 11:37:00", phone: "8765599932" },
  { doctorName: "Dr. Gaurav Bhargava", timeSlot: "05:20 PM - 05:30 PM", location: "स्वरूप नगर शाखा", patientName: "Saba Khan", fee: 1000, appointmentId: "", timestamp: "2026-07-17 11:25:00", phone: "7526093820" },
];

function parseTimestamp(str) {
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString();
  // Try with AM/PM
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return str;
  let [, y, m, day, h, min, sec, ampm] = match;
  h = parseInt(h);
  if (ampm) {
    if (ampm.toUpperCase() === "PM" && h !== 12) h += 12;
    if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
  }
  return `${y}-${m}-${day}T${String(h).padStart(2, "0")}:${min}:${sec || "00"}+05:30`;
}

async function main() {
  for (const apt of appointments) {
    const ts = parseTimestamp(apt.timestamp);
    const body = {
      doctorName: apt.doctorName,
      timeSlot: apt.timeSlot,
      location: apt.location,
      patientName: apt.patientName,
      fee: apt.fee,
      appointmentId: apt.appointmentId || undefined,
      timestamp: ts,
      phone: apt.phone || undefined,
    };

    try {
      const res = await fetch(`${BASE}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer admin" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✓ ${apt.patientName} — id: ${data.data?.appointmentId}`);
      } else {
        console.error(`✗ ${apt.patientName} — ${data.error}`);
      }
    } catch (err) {
      console.error(`✗ ${apt.patientName} — ${err.message}`);
    }
  }
}

main();
