import { Container } from 'react-bootstrap';
import { CampusMap } from '@/components/CampusMap';

export default function CampusPage() {
  return (
    <Container fluid className="p-6">
      <h1 className="text-3xl font-bold mb-6 fade-in-up">Campus Map</h1>
      <div className="slide-in-right">
        <CampusMap className="w-full" />
      </div>
    </Container>
  );
}
