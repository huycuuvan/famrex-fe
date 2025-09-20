export type MessageType = 'text' | 'json' | 'markdown' | 'table' | 'code' | 'chart' | 'file' | 'html';

export interface ParsedMessage {
  type: MessageType;
  content: any;
  metadata?: Record<string, any>;
}

// Cố gắng parse JSON một cách an toàn
const tryParseJson = (text: string): any | null => {
  try {
    // Loại bỏ các ký tự ```json` ở đầu và ``` ở cuối nếu có
    const cleanedText = text.trim().replace(/^```json\n|\n```$|```$/g, '').trim();
    const data = JSON.parse(cleanedText);
    // Chỉ chấp nhận object hoặc array, không chấp nhận chuỗi, số, boolean đơn thuần
    if (typeof data === 'object' && data !== null) {
      return data;
    }
    return null;
  } catch (e) {
    return null;
  }
};

// Kiểm tra xem có phải là một khối mã được chỉ định ngôn ngữ không
const isCodeBlock = (text: string): { isCode: boolean; lang?: string } => {
  const match = text.trim().match(/^```(\w+)?\n([\s\S]*?)\n```$/);
  if (match) {
    return { isCode: true, lang: match[1] || 'text' };
  }
  return { isCode: false };
};

// Kiểm tra xem có phải là HTML không
const isHtml = (text: string): boolean => {
  const trimmed = text.trim();
  // Dấu hiệu đơn giản: bắt đầu bằng tag HTML và kết thúc bằng tag HTML
  return trimmed.startsWith('<') && trimmed.endsWith('>') && /<\/\w+>$/.test(trimmed);
};

// Các hàm kiểm tra cho các loại nội dung đặc biệt từ AI
// Ví dụ: AI trả về một đối tượng JSON đặc biệt để biểu diễn file hoặc chart
const isFile = (json: any): boolean => !!(json.file_content && json.file_name);
const isChart = (json: any): boolean => !!(json.chart_data && json.chart_type);

// Trích xuất bảng Markdown đầu tiên từ văn bản
const extractMarkdownTable = (text: string): { tableContent: string | null; remainingText: string } => {
  const lines = text.split('\n');
  let tableLines: string[] = [];
  let remainingLines: string[] = [];
  let inTable = false;
  let tableFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isSeparator = line.includes('|') && line.replace(/[-|: ]/g, '').length === 0;
    const isTableRow = line.includes('|');

    if (!tableFound) {
      if (isTableRow && i + 1 < lines.length && lines[i+1].includes('|') && lines[i+1].replace(/[-|: ]/g, '').length === 0) {
        inTable = true;
        tableFound = true;
        tableLines.push(line); // Thêm dòng header
      } else {
        remainingLines.push(line);
      }
    } else if (inTable) {
      if (isTableRow) {
        tableLines.push(line);
      } else {
        inTable = false;
        remainingLines.push(line);
      }
    } else {
      remainingLines.push(line);
    }
  }

  return {
    tableContent: tableFound ? tableLines.join('\n') : null,
    remainingText: remainingLines.join('\n'),
  };
};

// Kiểm tra các dấu hiệu của Markdown
const isMarkdown = (text: string): boolean => {
  // Dấu hiệu: headings, lists, bold, italic, code blocks
  const markdownRegex = /(^#{1,6}\s)|(^\s*[-*+]\s)|(\*\*.*?\*\*)|(_.*?_)|(```)/;
  return markdownRegex.test(text);
};

export const parseMessageContent = (text: string): ParsedMessage => {
  const jsonContent = tryParseJson(text);
  if (jsonContent) {
    // Kiểm tra các định dạng JSON đặc biệt trước
    if (isFile(jsonContent)) {
      return {
        type: 'file',
        content: jsonContent.file_content,
        metadata: {
          filename: jsonContent.file_name,
          fileType: jsonContent.file_type || jsonContent.file_name.split('.').pop(),
        },
      };
    }
    if (isChart(jsonContent)) {
      return {
        type: 'chart',
        content: jsonContent.chart_data,
        metadata: {
          type: jsonContent.chart_type,
        },
      };
    }
    // Nếu không phải định dạng đặc biệt, thì là JSON thông thường
    return {
      type: 'json',
      content: jsonContent,
    };
  }

  // Kiểm tra code block trước markdown chung
  const codeCheck = isCodeBlock(text);
  if (codeCheck.isCode) {
    return {
      type: 'code',
      content: text.trim().replace(/^```\w*\n|\n```$/g, ''),
      metadata: { language: codeCheck.lang },
    };
  }

  // Sử dụng hàm mới để trích xuất bảng
  const { tableContent, remainingText } = extractMarkdownTable(text);
  if (tableContent) {
    return {
      type: 'table',
      content: tableContent,
      metadata: { remainingText: remainingText.trim() ? remainingText : null },
    };
  }

  if (isMarkdown(text)) {
    return {
      type: 'markdown',
      content: text,
    };
  }

  // Kiểm tra HTML sau cùng trước khi fallback về text
  if (isHtml(text)) {
    return {
      type: 'html',
      content: text,
    };
  }

  return {
    type: 'text',
    content: text,
  };
};
