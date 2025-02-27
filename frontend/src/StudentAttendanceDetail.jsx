import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Container, Table, Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

export function StudentAttendanceDetail({ isTeacher }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);

  // Check if state is valid
  useEffect(() => {
    if (!state?.student || !state?.updateAttendance) {
      navigate('/teacher-dashboard'); // Redirect if state is invalid
    } else {
      setRecords(state.student.attendanceRecords); // Initialize records
    }
  }, [state, navigate]);

  // If state is invalid, return null to prevent rendering
  if (!state?.student || !state?.updateAttendance) {
    return null;
  }

  const { student, updateAttendance } = state;

  // Update local state
  const handleUpdate = (recordId, newStatus) => {
    const updated = records.map((record) =>
      record.id === recordId ? { ...record, status: newStatus } : record
    );
    setRecords(updated);
  };

  // Save changes and navigate back to the teacher dashboard
  const handleSave = () => {
    updateAttendance(student.id, records); // Update parent state
    navigate('/teacher-dashboard'); // Navigate back to the teacher dashboard
  };

  return (
    <Container className="my-5">
      <Card className="shadow">
        <Card.Body>
          <h4 className="mb-3">{student.name}&apos;s Attendance</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                {isTeacher && <th>Update</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.time}</td>
                  <td>{record.status}</td>
                  {isTeacher && (
                    <td>
                      <Form.Select
                        value={record.status}
                        onChange={(e) => handleUpdate(record.id, e.target.value)}
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                      </Form.Select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
          {isTeacher && (
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

StudentAttendanceDetail.propTypes = {
  isTeacher: PropTypes.bool.isRequired,
};