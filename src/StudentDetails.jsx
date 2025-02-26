import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Container, Table, Form, Button } from 'react-bootstrap';

// Mock data (should ideally be fetched from an API)
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

export default function StudentDetails() {
  const { classId, studentId } = useParams();
  const [editMode, setEditMode] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Find the class and student based on the URL parameters
  const selectedClass = classes.find((cls) => cls.id === Number(classId));
  const student = selectedClass?.students.find((std) => std.id === Number(studentId));

  // Initialize attendance records
  if (attendanceRecords.length === 0 && student?.attendance.length > 0) {
    setAttendanceRecords(student.attendance);
  }

  // Handle status change for a specific record
  const handleStatusChange = (index, newStatus) => {
    const updatedRecords = [...attendanceRecords];
    updatedRecords[index].status = newStatus;
    setAttendanceRecords(updatedRecords);
  };

  // Save changes (e.g., send to an API)
  const handleSave = () => {
    console.log('Updated attendance records:', attendanceRecords);
    setEditMode(false); // Exit edit mode
  };

  if (!student) {
    return (
      <Container className="my-5">
        <h4>Student not found</h4>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Card className="shadow">
        <Card.Body>
          <h4 className="mb-3">{student.name}&apos;s Attendance Details</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                {editMode && <th>Update</th>}
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td>{record.time}</td>
                  <td>{record.status}</td>
                  {editMode && (
                    <td>
                      <Form.Select
                        value={record.status}
                        onChange={(e) => handleStatusChange(index, e.target.value)}
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                        <option value="Left Early">Left Early</option>
                      </Form.Select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
          <Button
            variant={editMode ? 'success' : 'primary'}
            onClick={editMode ? handleSave : () => setEditMode(true)}
            className="mt-3"
          >
            {editMode ? 'Save Changes' : 'Edit Attendance'}
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

// Helper function to generate mock attendance records
function generateAttendanceRecords() {
  return Array.from({ length: 15 }, (_, i) => ({
    date: new Date(Date.now() - (15 - i) * 86400000).toLocaleDateString(),
    time: '06:00 PM - 10:00 PM',
    status: Math.random() > 0.7 ? 'Absent' : 'Present',
  }));
}