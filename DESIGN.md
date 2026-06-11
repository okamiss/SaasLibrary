# DESIGN.md

# AI Company Assistant Design System

Version: 1.0

------

# Product Positioning

AI Company Assistant 是一个面向中小企业的 SaaS 企业知识库助手。

核心目标：

帮助企业将内部文档转化为可查询的 AI 知识库。

用户主要操作：

- 上传企业资料
- 管理知识库
- 向 AI 提问
- 查看引用来源
- 配置企业微信机器人

本产品属于：

B2B SaaS + AI Copilot

不是：

- ChatGPT Clone
- AI Agent Workflow Platform
- IM 聊天软件
- AI 创作工具

------

# Design Principles

设计必须遵循：

## Simple

优先简单。

减少视觉噪音。

避免复杂背景。

避免花哨效果。

------

## Professional

企业客户优先。

界面应体现：

- 稳定
- 可信
- 专业

而不是：

- 娱乐化
- 社区化
- 二次元化

------

## AI Native

让用户感受到 AI 的存在。

但不要让 AI 成为界面的全部。

AI 是能力。

知识库管理才是核心业务。

------

## Consistency

所有页面必须统一：

- 间距
- 圆角
- 字体
- 颜色
- 动效

------

# Visual Style

设计风格参考：

- Linear
- Notion
- Claude
- Stripe Dashboard

最终风格：

Linear Backend
+
Notion Documents
+
Claude AI Experience

------

# Avoid

禁止使用：

- Glassmorphism
- Cyberpunk
- Crypto 风格
- 彩虹渐变
- 大面积发光
- 浮夸动画
- 毛玻璃背景
- 炫酷粒子效果

------

# Color System

## Primary

用于：

- 按钮
- Logo
- 选中状态

```css
#7C3AED
```

------

## Primary Hover

```css
#6D28D9
```

------

## Text Primary

```css
#111827
```

------

## Text Secondary

```css
#6B7280
```

------

## Border

```css
#E5E7EB
```

------

## Background

```css
#FFFFFF
```

------

## Background Secondary

```css
#F9FAFB
```

------

## Success

```css
#16A34A
```

------

## Warning

```css
#F59E0B
```

------

## Error

```css
#DC2626
```

------

# Typography

## Font

Chinese:

```css
PingFang SC
HarmonyOS Sans
```

English:

```css
Inter
```

------

## Font Weight

Title:

```css
600
```

Body:

```css
400
```

Button:

```css
500
```

------

# Radius

统一圆角：

```css
12px
```

卡片：

```css
16px
```

按钮：

```css
10px
```

------

# Shadow

只允许轻阴影：

```css
0 1px 3px rgba(0,0,0,.08)
```

禁止重阴影。

------

# Layout

## Sidebar Width

```css
240px
```

------

## Content Max Width

```css
1600px
```

------

## Page Padding

```css
24px
```

------

# Navigation

结构：

Dashboard

Knowledge Base

- Documents

AI Assistant

- Ask AI
- Chat Logs

Integrations

- WeCom Bot

Settings

- Company
- Users

------

# Dashboard

风格：

Stripe Dashboard

------

顶部：

4个统计卡片：

- Documents
- Chunks
- Questions Today
- Success Rate

------

下方：

Recent Documents

Recent Questions

System Status

------

禁止：

- 大屏风格
- 数据驾驶舱
- 炫酷图表

------

# Document Page

这是核心页面。

参考：

Notion

------

必须包含：

- Upload Button
- Search
- Filter
- Table

------

状态显示：

Uploaded

Parsing

Completed

Failed

使用 Tag 展示。

------

解析进度：

使用 Step 状态。

例如：

Uploaded

↓

Parsing

↓

Embedding

↓

Completed

------

# Upload Experience

上传成功后：

显示解析状态。

必须让用户知道：

AI 正在处理文档。

------

禁止：

只显示 Loading。

------

推荐：

Progress + Steps

------

# Ask AI Page

这是核心 AI 页面。

参考：

Claude

------

布局：

Question Input

↓

Answer

↓

Sources

------

回答区域：

使用 Card

不要使用聊天气泡。

不要模拟微信聊天。

------

回答示例：

请假流程如下：

1. 提交申请
2. 部门审批
3. 人事备案

------

# Source Citation

必须展示引用来源。

每个来源显示：

- 文件名
- 文本片段
- 相似度

Card Style

Example:

员工手册.pdf

请假必须提前申请...

92% Match

------

用户点击后：

展开完整内容。

------

# Chat Logs

风格：

Linear Issue History

------

显示：

Question

Answer

Source

Time

------

支持：

搜索

分页

查看详情

------

# WeCom Bot

风格：

Settings 页面

------

展示：

Bot Name

Webhook

Status

Created Time

------

提供：

Test Send Button

------

# Empty State

所有页面必须设计空状态。

示例：

No Documents

Upload your first document to start building your company knowledge base.

------

# Loading State

必须使用 Skeleton。

禁止：

整页 Loading Spinner。

------

# Motion

所有动画保持克制。

Hover:

100ms

Modal:

200ms

Page Transition:

150ms

------

禁止：

复杂动画。

禁止：

超过300ms的动画。

------

# Dark Mode

必须支持。

优先使用：

Ant Design Theme Token

实现：

Light Mode

Dark Mode

双主题。

------

# Responsive

支持：

Desktop First

最低宽度：

1280px

MVP 阶段不考虑移动端。

------

# AI Design Rules

AI 页面必须突出：

可信度

而不是：

聪明感

因此：

必须展示：

- 来源文档
- 引用内容
- 相似度

禁止：

AI 直接回答且不显示依据。

------

# Development Rules

开发页面时：

优先使用：

Ant Design Components

禁止重复造轮子。

优先：

Card
Table
Tag
Drawer
Modal
Steps
Skeleton

保持统一设计语言。

------

# Final Goal

用户打开系统后的感受：

像 Linear 一样专业。

像 Notion 一样清晰。

像 Claude 一样智能。

而不是：

像一个聊天机器人网站。