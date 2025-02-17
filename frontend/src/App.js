// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Table, Badge, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Student Dashboard Component
function StudentDashboard() {
  const [attendance, setAttendance] = useState([
    { date: '2023-10-01', status: 'Present' },
    { date: '2023-10-02', status: 'Absent' },
  ]);
  const [isGeofenceActive, setIsGeofenceActive] = useState(false);
  const [isInsideBoundary, setIsInsideBoundary] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (isGeofenceActive && !isInsideBoundary) {
      setShowWarning(true);
      // Send notification
      if ('Notification' in window) {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') {
            new Notification('Boundary Alert', { 
              body: 'You have left the class boundary! Return immediately.' 
            });
          }
        });
      }
    } else {
      setShowWarning(false);
    }
  }, [isInsideBoundary, isGeofenceActive]);

  return (
    <Container className="my-5">
      <Navbar bg="light" className="mb-4">
        <Container>
          <Navbar.Brand>Student Portal</Navbar.Brand>
          <Badge bg={isGeofenceActive ? 'success' : 'secondary'}>
            {isGeofenceActive ? 'Class Active' : 'Class Inactive'}
          </Badge>
        </Container>
      </Navbar>

      {showWarning && (
        <Alert variant="danger" className="mb-4">
          ⚠️ You have left the class boundary! Return immediately.
        </Alert>
      )}

      <Card className="shadow">
        <Card.Body>
          <h4 className="mb-3">Attendance Record</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td>{record.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <div className="mt-4 text-center">
        <Button 
          variant="outline-primary"
          onClick={() => setIsInsideBoundary(!isInsideBoundary)}
        >
          Simulate Location: {isInsideBoundary ? 'Inside' : 'Outside'}
        </Button>
      </div>
    </Container>
  );
}

// Teacher Dashboard Component
function TeacherDashboard() {
  const [students, setStudents] = useState([
    { id: 1, name: 'Student 1', attendance: 'Present' },
    { id: 2, name: 'Student 2', attendance: 'Absent' },
  ]);
  const [isGeofenceActive, setIsGeofenceActive] = useState(false);

  const handleAttendanceChange = (studentId, newStatus) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, attendance: newStatus } : student
    ));
  };

  return (
    <Container className="my-5">
      <Navbar bg="light" className="mb-4">
        <Container>
          <Navbar.Brand>Teacher Portal</Navbar.Brand>
          <Button 
            variant={isGeofenceActive ? 'danger' : 'success'}
            onClick={() => setIsGeofenceActive(!isGeofenceActive)}
          >
            {isGeofenceActive ? 'Disable Boundaries' : 'Enable Boundaries'}
          </Button>
        </Container>
      </Navbar>

      <Card className="shadow">
        <Card.Body>
          <h4 className="mb-3">Manage Attendance</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.attendance}</td>
                  <td>
                    <Form.Select 
                      value={student.attendance}
                      onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Alert variant="info" className="mt-4">
        {isGeofenceActive 
          ? "Geofencing active - Students are being monitored"
          : "Geofencing inactive - No boundary checks"}
      </Alert>
    </Container>
  );
}

// Auth Component
function AuthForm({ isLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student'
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.userType === 'student') {
      navigate('/student-dashboard');
    } else {
      navigate('/teacher-dashboard');
    }
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center">
        <Col md={6} className="pe-5">
          <Card className="p-5 shadow">
            <h1 className="text-center mb-4">RollMate</h1>
            <p className="lead text-center">
              {isLogin ? 'Sign in to continue' : 'Create an account to get started'}
            </p>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </h2>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Select
                    value={formData.userType}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mb-3">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>

                <div className="text-center">
                  {isLogin ? 
                    <>New user? <Link to="/signup">Sign up</Link></> : 
                    <>Have an account? <Link to="/login">Sign in</Link></>}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

// Main Router
function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthForm isLogin={true} />} />
        <Route path="/signup" element={<AuthForm isLogin={false} />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/" element={<AuthForm isLogin={true} />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;