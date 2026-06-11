import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AskAiPage } from '../pages/AskAiPage';
import { ChatLogsPage } from '../pages/ChatLogsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { WecomBotsPage } from '../pages/WecomBotsPage';

export function AppRouter() {
  return (
    <AppLayout>
      <Routes>
        <Route element={<DashboardPage />} path="/" />
        <Route element={<DocumentsPage />} path="/documents" />
        <Route element={<AskAiPage />} path="/ask-ai" />
        <Route element={<ChatLogsPage />} path="/chat-logs" />
        <Route element={<WecomBotsPage />} path="/wecom-bots" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </AppLayout>
  );
}
