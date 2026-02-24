import {
  Page,
  A4_WIDTH,
  A4_HEIGHT,
  TemplateState,
} from '@/types';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

const cssToStyleString = (style: Record<string, unknown>): string => {
  if (!style) return '';
  return Object.entries(style)
    .map(([key, value]) => {
      if (value === undefined || value === null) return '';
      const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      return `${kebabKey}: ${value};`;
    })
    .filter((s) => s !== '')
    .join(' ');
};

export const generateGotenbergHTML = (state: TemplateState) => {
  const { pages, canvasSettings } = state;

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

      const { x, y, width, height, rotation, style, type, content } = el;

      const positionStyle = {
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotation || 0}deg)`,
      };

      const combinedStyle = { ...style, ...positionStyle };
      const styleStr = cssToStyleString(combinedStyle as Record<string, unknown>);

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
    margins: canvasSettings.margins,
  };
};

export const downloadGotenbergZip = async (state: TemplateState) => {
  const { indexHtml, headerHtml, footerHtml } = generateGotenbergHTML(state);
  const zip = new JSZip();

  zip.file('index.html', indexHtml);
  if (headerHtml) zip.file('header.html', headerHtml);
  if (footerHtml) zip.file('footer.html', footerHtml);

  const readme = `Gotenberg Export Info
---------------------
Template Name: ${state.name || 'Untitled'}
A4 Dimensions: ${A4_WIDTH}px x ${A4_HEIGHT}px

Recommended Gotenberg API Parameters:
- marginTop: ${state.canvasSettings.margins.top / 96} (in inches, approx)
- marginBottom: ${state.canvasSettings.margins.bottom / 96}
- marginLeft: ${state.canvasSettings.margins.left / 96}
- marginRight: ${state.canvasSettings.margins.right / 96}

See docs/GOTENBERG-AGENT.md for full API usage (convert-html-to-pdf).
`;
  zip.file('readme.txt', readme);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.name || 'template'}-gotenberg.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateHTML = (
  pages: Page[],
  backgroundColor: string
): string => {
  const styles = `
    body { margin: 0; padding: 0; background: #555; display: flex; flex-direction: column; align-items: center; min-height: 100vh; font-family: sans-serif; gap: 20px; padding: 20px; }
    .page {
      position: relative;
      width: ${A4_WIDTH}px;
      height: ${A4_HEIGHT}px;
      background-color: ${backgroundColor};
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    .element { position: absolute; box-sizing: border-box; }
    @media print {
      body { background: white; display: block; padding: 0; gap: 0; }
      .page { box-shadow: none; margin: 0; page-break-after: always; width: 100%; height: 100%; }
      .page:last-child { page-break-after: auto; }
    }
  `;

  const pagesHtml = pages
    .map((page, index) => {
      const elementsHtml = page.elements
        .filter((el) => el.isVisible)
        .map((el) => {
          const styleString = Object.entries(el.style)
            .map(([k, v]) => {
              const key = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
              return `${key}: ${v}`;
            })
            .join('; ');

          const commonStyle = `left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; ${styleString}`;

          if (el.type === 'text') {
            return `<div class="element" style="${commonStyle}">${el.content}</div>`;
          }
          if (el.type === 'image') {
            return `<img class="element" src="${el.content}" style="${commonStyle}; object-fit: cover;" />`;
          }
          return `<div class="element" style="${commonStyle}; border-radius: ${el.style.borderRadius || '0'}"></div>`;
        })
        .join('\n');

      return `
    <!-- Page ${index + 1}: ${page.name} -->
    <div class="page" id="page-${page.id}">
      ${elementsHtml}
    </div>`;
    })
    .join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exported Template</title>
  <style>${styles}</style>
</head>
<body>
  ${pagesHtml}
</body>
</html>
  `;
};

export const downloadHTML = (
  pages: Page[],
  backgroundColor: string
): void => {
  const html = generateHTML(pages, backgroundColor);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadImage = async (
  elementId: string,
  format: 'png' | 'jpeg'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const controls = element.querySelectorAll('.controls');
  controls.forEach((el: Element) => ((el as HTMLElement).style.display = 'none'));

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });

    const link = document.createElement('a');
    link.download = `template.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, 1.0);
    link.click();
  } catch (err) {
    console.error('Export failed', err);
    alert('Export failed. Note: External images must allow CORS.');
  } finally {
    controls.forEach((el: Element) => ((el as HTMLElement).style.display = ''));
  }
};

export const printToPDF = (
  pages: Page[],
  backgroundColor: string
): void => {
  const html = generateHTML(pages, backgroundColor);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
};
