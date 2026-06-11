import { App as AntApp } from 'antd';
import { AppRouter } from './router/AppRouter';

export default function App() {
  return (
    <AntApp>
      <AppRouter />
    </AntApp>
  );
}
