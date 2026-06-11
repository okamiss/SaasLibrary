import { Card, Typography } from 'antd';

const { Paragraph, Title } = Typography;

export default function App() {
  return (
    <main className="app-shell">
      <Card className="app-card">
        <Title level={1}>AI Company Assistant</Title>
        <Paragraph type="secondary">
          Phase 1 scaffold is ready for the SaaS knowledge base assistant.
        </Paragraph>
      </Card>
    </main>
  );
}
