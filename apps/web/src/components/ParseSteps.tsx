import type { DocumentStatus } from '@ai-company-assistant/shared';
import { Steps } from 'antd';

function getCurrentStep(status: DocumentStatus) {
  if (status === 'uploaded') {
    return 0;
  }

  if (status === 'parsing') {
    return 1;
  }

  return 3;
}

export function ParseSteps({ status }: { status: DocumentStatus }) {
  return (
    <Steps
      size="small"
      current={getCurrentStep(status)}
      status={status === 'failed' ? 'error' : 'process'}
      items={[
        { title: 'Uploaded' },
        { title: 'Parsing' },
        { title: 'Embedding' },
        { title: 'Completed' }
      ]}
    />
  );
}
