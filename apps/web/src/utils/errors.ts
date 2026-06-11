import type { AxiosError } from 'axios';
import { isAxiosError } from 'axios';

interface ApiErrorBody {
  message?: string | string[];
  error?: string;
}

export function getFriendlyErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorBody>(error)) {
    return getAxiosErrorMessage(error);
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return '操作失败，请稍后重试。';
}

function getAxiosErrorMessage(error: AxiosError<ApiErrorBody>) {
  const status = error.response?.status;
  const bodyMessage = error.response?.data?.message;
  const message = Array.isArray(bodyMessage)
    ? bodyMessage.join('；')
    : bodyMessage;

  if (status === 401) {
    return '登录状态已失效，请重新设置 Access Token。';
  }

  if (status === 403) {
    return '当前账号没有权限执行该操作。';
  }

  if (message) {
    return message;
  }

  if (error.code === 'ECONNABORTED') {
    return '请求超时，请稍后重试。';
  }

  if (!error.response) {
    return '无法连接到 API 服务，请检查 VITE_API_BASE_URL。';
  }

  return '接口请求失败，请稍后重试。';
}
