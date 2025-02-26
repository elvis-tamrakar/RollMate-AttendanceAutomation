/* eslint-disable react/prop-types */
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, Navigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './Login.css';
import rollMateImage from './assets/RollMate.png';
import process from 'process';
import { StudentDashboard } from './StudentDashboard'; // Updated path
import TeacherDashboard from './TeacherDashboard'; // Correct import for default export
import StudentDetails from './StudentDetails'; // Import the updated component
import { StudentAttendanceDetail } from './StudentAttendanceDetail'; // Import the new component

window.process = process;

// AuthForm Component
function AuthForm({ isLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student',
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/${formData.userType}-dashboard`);
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center">
        <Col md={6} className="pe-5">
          <Card className="p-5 shadow">
            <img src={rollMateImage} alt="RollMate Logo" className="w-100 mb-4" />
            <p className="lead text-center">
              {isLogin ? 'Sign in to continue' : 'Create an account to get started'}
            </p>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Select
                    value={formData.userType}
                    onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mb-3">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>

                <div className="text-center">
                  {isLogin ? (
                    <>New user? <Link to="/signup">Sign up</Link></>
                  ) : (
                    <>Have an account? <Link to="/login">Sign in</Link></>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

function App() {
  // Function to determine if the user is a teacher
  const isTeacher = () => {
    // Replace this logic with your actual authentication/role-checking logic
    const userType = localStorage.getItem('userType'); // Example: Get user type from localStorage
    return userType === 'teacher';
  };

  return (
    <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<AuthForm isLogin={true} />} />
      <Route path="/signup" element={<AuthForm isLogin={false} />} />
      <Route path="/class/:classId/student/:studentId" element={<StudentDetails />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} /> {/* Correct usage */}
      <Route path="/class/:classId/student/:studentId" element={<StudentDetails />} />
      <Route
        path="/student/:studentId"
        element={<StudentAttendanceDetail isTeacher={isTeacher()} />}
      />
    </Routes>
  </Router>
  );
}

export default App;
