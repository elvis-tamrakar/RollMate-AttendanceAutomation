import { Card, Container, Table } from 'react-bootstrap';

export function StudentDashboard() {
  // Static attendance data (generated once)
  const attendance = generateAttendanceRecords();

  return (
    <Container className="my-5">
      <Card className="shadow">
        <Card.Body>
          <h4 className="mb-3">Your Attendance Record</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.time}</td>
                  <td>{record.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

// Generate static records (no random changes)
function generateAttendanceRecords() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    date: new Date(Date.now() - (15 - i) * 86400000).toLocaleDateString(),
    time: '06:00 PM - 10:00 PM',
    status: 'Present', // Default static status
  }));
}