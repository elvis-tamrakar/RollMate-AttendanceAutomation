import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';

// Student Dashboard Component
function StudentDashboard() {
  const [attendanceStatus, setAttendanceStatus] = useState(null); // Track attendance status
  const [scanStatus, setScanStatus] = useState(false); // Track if scan is initiated
  const [scanned, setScanned] = useState(false); // Track if scan is successful

  const handleAttendance = (status) => {
    setAttendanceStatus(status); // Update attendance status when clicked
  };

  const handleScan = () => {
    setScanStatus(true); // Update to show scanning process when clicked
    setTimeout(() => {
      setScanStatus(false); // Reset after scan (simulate scanning process)
      setScanned(true); // Mark as scanned
      alert("Scan successful! Now select your attendance.");
    }, 2000); // Simulate scan time (2 seconds)
  };

  return (
    <div className="dashboard student-dashboard">
      <h2>Welcome, Student!</h2>

      <div className="attendance-management">
        <h3>Please scan your phone/ID</h3>
        <div className="attendance-form">
          <div className="circle-button" onClick={handleScan}>
            {scanStatus ? "Scanning..." : "Scan ID/Phone"}
          </div>
          {scanned && (
            <>
              <div
                className={`circle-button ${attendanceStatus === 'present' ? 'active-green' : ''}`}
                onClick={() => handleAttendance('present')}
              >
                Present
              </div>
              <div
                className={`circle-button ${attendanceStatus === 'absent' ? 'active-red' : ''}`}
                onClick={() => handleAttendance('absent')}
              >
                Absent
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Teacher Dashboard Component
function TeacherDashboard() {
  const [students, setStudents] = useState([
    { name: 'Student 1', status: 'present' },
    { name: 'Student 2', status: 'absent' },
    { name: 'Student 3', status: 'present' },
  ]);
  const [selectedStudent, setSelectedStudent] = useState(""); // Track selected student
  const [attendanceStatus, setAttendanceStatus] = useState(""); // Track attendance status of selected student

  const handleSelectStudent = (event) => {
    const studentName = event.target.value;
    setSelectedStudent(studentName); // Update selected student

    const student = students.find(student => student.name === studentName);
    if (student) {
      setAttendanceStatus(student.status); // Show selected student's attendance status
    }
  };

  return (
    <div className="dashboard teacher-dashboard">
      <h2>Welcome, Teacher!</h2>

      <div className="students-list">
        <h3>Choose a Student</h3>
        <select value={selectedStudent} onChange={handleSelectStudent} className="student-select">
          <option value="">Select a Student</option>
          {students.map((student, index) => (
            <option key={index} value={student.name}>
              {student.name}
            </option>
          ))}
        </select>

        {selectedStudent && (
          <div className="student-status">
            <h4>Attendance Status</h4>
            <p>{attendanceStatus === 'present' ? 'Present' : 'Absent'}</p>
          </div>
        )}

        <ul>
          {students.map((student, index) => (
            <li key={index} className={`student-item ${student.status === 'present' ? 'green' : 'red'}`}>
              {student.name} - {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      // Redirect based on user type (student or teacher)
      if (userType === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/teacher-dashboard');
      }
    } else {
      alert('Please enter valid credentials');
    }
  };

  return (
    <div className="container">
      <div className="description">
        <h2>Attendance Tracking System</h2>
        <p>
          Welcome to the Attendance Tracking System. This system uses Geofencing and Biometric Authentication for accurate tracking.
          Here, students and teachers can manage attendance efficiently and securely.
        </p>
      </div>

      <div className="signin-container">
        <div className="signin-card">
          <h2>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <button type="submit">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main App Component (with Router)
function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
