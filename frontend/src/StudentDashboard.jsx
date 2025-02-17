import { useState } from 'react';
import { Button, Card, Container, Navbar, Table } from 'react-bootstrap';

// Named export for StudentDashboard
export function StudentDashboard() {
  const [attendance] = useState([
    { date: '2023-10-01', status: 'Present' },
    { date: '2023-10-02', status: 'Absent' },
  ]);
  const [isGeofenceActive, setIsGeofenceActive] = useState(false);
  const [isInsideBoundary, setIsInsideBoundary] = useState(true);

  const handleGeofenceToggle = () => {
    setIsGeofenceActive((prevState) => !prevState);
  };

  return (
    <Container className="my-5">
      <Navbar bg="light" className="mb-4">
        <Navbar.Brand>Student Portal</Navbar.Brand>
        <Button onClick={handleGeofenceToggle}>
          {isGeofenceActive ? 'Disable Geofence' : 'Enable Geofence'}
        </Button>
      </Navbar>

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
        <Button variant="outline-primary" onClick={() => setIsInsideBoundary(!isInsideBoundary)}>
          Simulate Location: {isInsideBoundary ? 'Inside' : 'Outside'}
        </Button>
      </div>
    </Container>
  );
}