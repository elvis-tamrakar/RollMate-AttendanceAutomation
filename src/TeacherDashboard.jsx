import { useState } from 'react';
import { Container, Navbar, Card, Table, Button, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Mock data
const classes = [
  {
    id: 1,
    name: 'Class 10A',
    students: [
      { id: 1, name: 'Karuna Dahal', attendance: generateAttendanceRecords() },
      { id: 2, name: 'Rijan Gurung', attendance: generateAttendanceRecords() },
    ],
  },
  {
    id: 2,
    name: 'Class 11B',
    students: [
      { id: 3, name: 'Elvish Tamakar', attendance: generateAttendanceRecords() },
    ],
  },
];

// Helper function to generate mock attendance records
function generateAttendanceRecords() {
  return Array.from({ length: 15 }, (_, i) => ({
    date: new Date(Date.now() - (15 - i) * 86400000).toLocaleDateString(),
    time: '06:00 PM - 10:00 PM',
    status: Math.random() > 0.7 ? 'Absent' : 'Present',
  }));
}

export default function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [isGeofenceActive, setIsGeofenceActive] = useState(false);
  const navigate = useNavigate();

  const handleClassChange = (classId) => {
    const selected = classes.find((c) => c.id === Number(classId));
    setSelectedClass(selected);
  };

  return (
    <Container className="my-5">
      <Navbar bg="light" className="mb-4">
        <Navbar.Brand>Teacher Portal</Navbar.Brand>
        <Button
          variant={isGeofenceActive ? 'danger' : 'success'}
          onClick={() => setIsGeofenceActive(!isGeofenceActive)}
        >
          {isGeofenceActive ? 'Disable Geofence' : 'Enable Geofence'}
        </Button>
      </Navbar>

      <Card className="shadow mb-4">
        <Card.Body>
          <h4 className="mb-3">Select Class</h4>
          <Form.Select onChange={(e) => handleClassChange(e.target.value)}>
            <option value="">Choose a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </Form.Select>
        </Card.Body>
      </Card>

      {selectedClass && (
        <Card className="shadow">
          <Card.Body>
            <h4 className="mb-3">{selectedClass.name} Students</h4>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Attendance Percentage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedClass.students.map((student) => {
                  const totalRecords = student.attendance.length;
                  const presentRecords = student.attendance.filter((a) => a.status === 'Present').length;
                  const attendancePercentage = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

                  return (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{attendancePercentage.toFixed(1)}%</td>
                      <td>
                        <Button
                          variant="primary"
                          onClick={() =>
                            navigate(`/class/${selectedClass.id}/student/${student.id}`)
                          }
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Alert variant="info" className="mt-4">
        {isGeofenceActive
          ? 'Geofencing active - Students are being monitored'
          : 'Geofencing inactive - No boundary checks'}
      </Alert>
    </Container>
  );
}