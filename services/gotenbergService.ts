import { TemplateState, EditorElement, A4_WIDTH, A4_HEIGHT } from '../types';

const cssToStyleString = (style: any): string => {
  if (!style) return '';
  return Object.entries(style)
    .map(([key, value]) => {
      if (value === undefined || value === null) return '';
      const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      return `${kebabKey}: ${value};`;
    })
    .filter(s => s !== '')
    .join(' ');
};

export const generateGotenbergHTML = (state: TemplateState) => {
  const { pages, canvasSettings } = state;

  // 1. Generate index.html (Main Content)
  let indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${state.name || 'Template'}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: white;
            font-family: sans-serif;
            -webkit-print-color-adjust: exact;
        }
        .page {
            position: relative;
            width: ${A4_WIDTH}px;
            height: ${A4_HEIGHT}px;
            overflow: hidden;
            background-color: ${canvasSettings.backgroundColor};
            page-break-after: always;
        }
        .element {
            position: absolute;
            box-sizing: border-box;
        }
        .element-content {
            width: 100%;
            height: 100%;
            position: relative;
        }
        img {
            display: block;
        }
        @media print {
            body {
                width: ${A4_WIDTH}px;
            }
            .page {
                page-break-after: always;
                margin: 0;
                border: none;
            }
        }
    </style>
</head>
<body>
`;

  pages.forEach((page) => {
    indexHtml += `  <div class="page">\n`;
    page.elements.forEach((el) => {
      if (!el.isVisible) return;
      
      // Separate positioning from other styles
      const { x, y, width, height, rotation, style, type, content } = el;
      
      const positionStyle = {
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotation || 0}deg)`,
      };

      const combinedStyle = { ...style, ...positionStyle };
      const styleStr = cssToStyleString(combinedStyle);

      indexHtml += `    <div class="element" style="${styleStr}">\n`;
      indexHtml += `      <div class="element-content">\n`;

      if (type === 'text') {
        indexHtml += `        <div style="width: 100%; height: 100%; overflow: hidden; word-wrap: break-word; white-space: pre-wrap;">${content}</div>\n`;
      } else if (type === 'image') {
        indexHtml += `        <img src="${content}" style="width: 100%; height: 100%; object-fit: cover; border-radius: ${style.borderRadius || '0'};" />\n`;
      } else if (type === 'box' || type === 'circle' || type === 'line') {
        indexHtml += `        <div style="width: 100%; height: 100%; border-radius: ${style.borderRadius || '0'};"></div>\n`;
      } else if (type === 'svg') {
        indexHtml += `        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 100%; overflow: visible;">
          <path d="${content}" fill="${style.backgroundColor || 'transparent'}" stroke="${style.borderColor || 'transparent'}" stroke-width="${parseInt(style.borderWidth?.toString() || '0') * (100 / width)}" vector-effect="non-scaling-stroke" />
        </svg>\n`;
      }

      indexHtml += `      </div>\n`;
      indexHtml += `    </div>\n`;
    });
    indexHtml += `  </div>\n`;
  });

  indexHtml += `</body>\n</html>`;

  // 2. Generate header.html
  const header = canvasSettings.header;
  let headerHtml = '';
  if (header.enabled) {
    headerHtml = `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            font-family: sans-serif;
        }
        .header {
            width: 100%;
            font-size: 10px;
            display: flex;
            align-items: center;
            padding: 0 20px;
            box-sizing: border-box;
            height: ${header.height}px;
            justify-content: ${header.alignment === 'left' ? 'flex-start' : header.alignment === 'right' ? 'flex-end' : 'center'};
        }
    </style>
</head>
<body>
    <div class="header">
        ${header.htmlContent || ''}
    </div>
</body>
</html>`;
  }

  // 3. Generate footer.html
  const footer = canvasSettings.footer;
  let footerHtml = '';
  if (footer.enabled) {
    footerHtml = `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            font-family: sans-serif;
        }
        .footer {
            width: 100%;
            font-size: 10px;
            display: flex;
            align-items: center;
            padding: 0 20px;
            box-sizing: border-box;
            height: ${footer.height}px;
            justify-content: ${footer.alignment === 'left' ? 'flex-start' : footer.alignment === 'right' ? 'flex-end' : 'center'};
        }
    </style>
</head>
<body>
    <div class="footer">
        ${footer.type === 'html' ? (footer.htmlContent || '') : `<span>${footer.paginationPrefix || ''} <span class="pageNumber"></span> / <span class="totalPages"></span></span>`}
    </div>
</body>
</html>`;
  }

  return {
    indexHtml,
    headerHtml,
    footerHtml,
    margins: canvasSettings.margins
  };
};
