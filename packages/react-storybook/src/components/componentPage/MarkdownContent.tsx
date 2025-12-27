import React from "react";

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  // Enhanced markdown rendering with better support for lists and formatting
  const formatMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];

    const processLine = (line: string, index: number) => {
      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith("## ")) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc list-inside mb-4 space-y-2">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        return (
          <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-900">
            {trimmed.replace(/^##+\s+/, "")}
          </h2>
        );
      }
      if (trimmed.startsWith("### ")) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc list-inside mb-4 space-y-2">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        return (
          <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-gray-800">
            {trimmed.replace(/^###+\s+/, "")}
          </h3>
        );
      }

      // List items
      if (trimmed.startsWith("- ")) {
        inList = true;
        const content = trimmed.replace(/^-\s+/, "");
        // Process bold text and links in list items
        const processedContent = processInlineFormatting(content);
        listItems.push(
          <li key={index} className="mb-2 text-gray-700">
            {processedContent}
          </li>
        );
        return null;
      }

      // End of list
      if (inList && trimmed === "") {
        inList = false;
        const list = (
          <ul key={`list-${index}`} className="list-disc list-inside mb-4 space-y-2">
            {listItems}
          </ul>
        );
        listItems = [];
        return list;
      }

      // Regular paragraphs
      if (trimmed && !inList) {
        return (
          <p key={index} className="mb-4 text-gray-700">
            {processInlineFormatting(line)}
          </p>
        );
      }

      // Empty lines (outside of lists)
      if (trimmed === "" && !inList) {
        return <br key={index} />;
      }

      return null;
    };

    const processInlineFormatting = (text: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let remaining = text;

      // Process links first (they can contain bold text)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(remaining)) !== null) {
        // Add text before link
        if (match.index > lastIndex) {
          const beforeLink = remaining.substring(lastIndex, match.index);
          parts.push(...processBoldText(beforeLink));
        }
        // Add link
        parts.push(
          <a
            key={match.index}
            href={match[2]}
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {processBoldText(match[1])}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < remaining.length) {
        const afterLinks = remaining.substring(lastIndex);
        parts.push(...processBoldText(afterLinks));
      }

      return parts.length > 0 ? parts : [text];
    };

    const processBoldText = (text: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      const boldRegex = /\*\*([^*]+)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-semibold">
            {match[1]}
          </strong>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts.length > 0 ? parts : [text];
    };

    // Process all lines
    lines.forEach((line, index) => {
      const element = processLine(line, index);
      if (element) {
        elements.push(element);
      }
    });

    // Close any remaining list
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key="list-final" className="list-disc list-inside mb-4 space-y-2">
          {listItems}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div className="prose prose-slate max-w-none">
      <div className="markdown-content">{formatMarkdown(content)}</div>
    </div>
  );
};

