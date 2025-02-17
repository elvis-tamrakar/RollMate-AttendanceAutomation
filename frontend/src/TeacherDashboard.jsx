import { useState } from 'react';
import { Alert, Button, Card, Container, Form, Navbar, Table } from 'react-bootstrap';

// Named export for TeacherDashboard
export function TeacherDashboard() {
  const [students, setStudents] = useState([
    { id: 1, name: 'Student 1', attendance: 'Present' },
    { id: 2, name: 'Student 2', attendance: 'Absent' },
  ]);
  const [isGeofenceActive, setIsGeofenceActive] = useState(false);

  const handleAttendanceChange = (studentId, newStatus) => {
    setStudents(
      students.map((student) =>
        student.id === studentId ? { ...student, attendance: newStatus } : student
      )
    );
  };

  return (
    <Container className="my-5">
      <Navbar bg="light" className="mb-4">
        <Navbar.Brand>Teacher Portal</Navbar.Brand>
        <Button
          variant={isGeofenceActive ? 'danger' : 'success'}
          onClick={() => setIsGeofenceActive(!isGeofenceActive)}
        >
          {isGeofenceActive ? 'Disable Boundaries' : 'Enable Boundaries'}
        </Button>
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
              {students.map((student) => (
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
          ? 'Geofencing active - Students are being monitored'
          : 'Geofencing inactive - No boundary checks'}
      </Alert>
    </Container>
  );
}