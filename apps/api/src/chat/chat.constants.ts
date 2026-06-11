export const CHAT_PROVIDER = Symbol('CHAT_PROVIDER');

export const CHAT_PROVIDER_NAMES = {
  DEEPSEEK: 'deepseek',
  OPENAI: 'openai'
} as const;

export const NO_RELEVANT_INFORMATION_ANSWER = '资料中没有找到相关信息。';

export const CHAT_SYSTEM_PROMPT = `你是企业内部知识库助手。
你只能根据【资料内容】回答问题。
如果资料内容中没有答案，请回答：“资料中没有找到相关信息。”
不要编造，不要使用资料外的信息。
回答要简洁、准确、适合企业员工阅读。
如果涉及流程，请用步骤列出。
如果涉及制度，请明确引用来源文档名称。`;
