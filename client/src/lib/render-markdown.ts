const parseMarkdownTable = (tableText: string): { headers: string[]; rows: string[][] } | null => {
  const lines = tableText.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) return null;

  const parseRow = (line: string): string[] => {
    return line.split('|')
      .map(cell => cell.trim())
      .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1 || (idx === 0 && cell) || (idx === arr.length - 1 && cell));
  };

  const headers = parseRow(lines[0]);
  if (headers.length === 0) return null;

  const dataStartIdx = lines[1]?.match(/^[\|\s\-:]+$/) ? 2 : 1;

  const rows: string[][] = [];
  for (let i = dataStartIdx; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length > 0) rows.push(row);
  }

  return { headers, rows };
};

const sanitizeCellContent = (cell: string): string => {
  return cell.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, href) => {
    const sanitizedHref = /^\s*(javascript|data|vbscript):/i.test(href) ? '#' : href;
    return `<a href="${sanitizedHref}" class="text-[#21d8ff] underline underline-offset-2 hover:text-[#21d8ff]/80 transition-colors">${text}</a>`;
  });
};

const renderTable = (table: { headers: string[]; rows: string[][] }): string => {
  const headerCells = table.headers
    .map(h => `<th class="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-[#21d8ff] border-b border-[#21d8ff]/30">${sanitizeCellContent(h)}</th>`)
    .join('');

  const bodyRows = table.rows
    .map((row, rowIdx) => {
      const cells = row
        .map((cell, cellIdx) => {
          const isFirstCol = cellIdx === 0;
          const cellClass = isFirstCol
            ? 'px-3 py-2 text-xs font-medium text-foreground whitespace-nowrap'
            : 'px-3 py-2 text-xs text-muted-foreground';
          return `<td class="${cellClass}">${sanitizeCellContent(cell)}</td>`;
        })
        .join('');
      const rowClass = rowIdx % 2 === 0 ? 'bg-[#21d8ff]/5' : 'bg-transparent';
      return `<tr class="${rowClass} hover:bg-[#21d8ff]/10 transition-colors">${cells}</tr>`;
    })
    .join('');

  return `<div class="my-4 overflow-hidden rounded-lg border border-[#21d8ff]/30 bg-gradient-to-br from-[#21d8ff]/5 to-transparent shadow-[0_0_15px_rgba(33,216,255,0.1)]"><table class="min-w-full divide-y divide-[#21d8ff]/20"><thead class="bg-[#21d8ff]/10"><tr>${headerCells}</tr></thead><tbody class="divide-y divide-border/50">${bodyRows}</tbody></table></div>`;
};

export const renderMarkdown = (content: string): string => {
  const tableRegex = /(^\s*\|[^\n]+\|[ \t]*\n?)+/gm;
  let processedContent = content.replace(tableRegex, (match) => {
    const table = parseMarkdownTable(match);
    if (table && table.headers.length > 0 && table.rows.length > 0) {
      return renderTable(table);
    }
    return match;
  });

  processedContent = processedContent.replace(/^\s*\|?[\s\-:]+\|[\s\-:|]+\s*$/gm, '');

  processedContent = processedContent.replace(
    /(^(\d+)\. .+$(\n^(\d+)\. .+$)*)/gm,
    (match) => {
      const items = match
        .split('\n')
        .map(line => line.replace(/^\d+\. (.+)$/, '<li class="ml-3">$1</li>'))
        .join('');
      return `<ol class="list-decimal ml-3 my-3 space-y-1 text-sm">${items}</ol>`;
    }
  );

  processedContent = processedContent.replace(
    /(^- .+$(\n^- .+$)*)/gm,
    (match) => {
      const items = match
        .split('\n')
        .map(line => line.replace(/^- (.+)$/, '<li class="ml-3">$1</li>'))
        .join('');
      return `<ul class="list-disc ml-3 my-3 space-y-1 text-sm">${items}</ul>`;
    }
  );

  processedContent = processedContent.replace(
    /^> (.+)$/gm,
    '<div class="my-3 pl-3 border-l-2 border-[#E7FB10]/50 bg-[#E7FB10]/5 py-2 pr-3 rounded-r text-sm italic text-muted-foreground">$1</div>'
  );

  processedContent = processedContent.replace(/^---$/gm, '<hr class="my-6 border-border/50" />');

  return processedContent
    .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold mt-4 mb-2 text-foreground flex items-center gap-2"><span class="w-1 h-4 bg-[#9d4edd] rounded-full"></span>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold mt-5 mb-2 text-foreground border-b border-[#21d8ff]/20 pb-1">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold mt-5 mb-3 text-foreground">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, href) => {
      const sanitizedHref = /^\s*(javascript|data|vbscript):/i.test(href) ? '#' : href;
      return `<a href="${sanitizedHref}" class="text-[#21d8ff] underline underline-offset-2 hover:text-[#21d8ff]/80 transition-colors">${text}</a>`;
    })
    .replace(/\n\n/g, '</p><p class="mb-2 text-sm leading-relaxed">')
    .replace(/^(?!\s*<)/gm, '<p class="mb-2 text-sm leading-relaxed">');
};
