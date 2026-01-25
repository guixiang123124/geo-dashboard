/**
 * Export utilities for CSV and PDF generation.
 */

import type {
  BrandWithScore,
  TimeSeriesDataPoint,
  ModelComparisonData,
  HeatmapCell,
} from './types';

// ============ CSV Export ============

/**
 * Convert data array to CSV string.
 */
export function toCSV<T extends Record<string, unknown>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return '';

  const keys = columns ? columns.map((c) => c.key) : (Object.keys(data[0]) as (keyof T)[]);
  const headers = columns ? columns.map((c) => c.label) : keys.map(String);

  const rows = data.map((row) =>
    keys
      .map((key) => {
        const value = row[key];
        // Escape quotes and wrap in quotes if contains comma
        const strValue = String(value ?? '');
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      })
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Download data as CSV file.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ============ Brand Export ============

export function exportBrandsToCSV(brands: BrandWithScore[]): void {
  const data = brands.map((brand) => ({
    Name: brand.name,
    Category: brand.category,
    Domain: brand.domain || '',
    'Composite Score': brand.score?.composite_score ?? 'N/A',
    'Visibility Score': brand.score?.visibility_score ?? 'N/A',
    'Citation Score': brand.score?.citation_score ?? 'N/A',
    'Representation Score': brand.score?.representation_score ?? 'N/A',
    'Intent Score': brand.score?.intent_score ?? 'N/A',
    'Total Mentions': brand.score?.total_mentions ?? 0,
    'Avg Rank': brand.score?.avg_rank?.toFixed(1) ?? 'N/A',
    'Citation Rate': brand.score?.citation_rate
      ? `${(brand.score.citation_rate * 100).toFixed(1)}%`
      : 'N/A',
    'Intent Coverage': brand.score?.intent_coverage
      ? `${(brand.score.intent_coverage * 100).toFixed(1)}%`
      : 'N/A',
  }));

  const csv = toCSV(data);
  downloadCSV(csv, `geo-insights-brands-${new Date().toISOString().split('T')[0]}`);
}

// ============ Time Series Export ============

export function exportTimeSeriesData(data: TimeSeriesDataPoint[]): void {
  const exportData = data.map((point) => ({
    Date: point.date,
    'Composite Score': point.composite,
    'Visibility Score': point.visibility,
    'Citation Score': point.citation,
    'Representation Score': point.representation,
    'Intent Score': point.intent,
  }));

  const csv = toCSV(exportData);
  downloadCSV(csv, `geo-insights-trends-${new Date().toISOString().split('T')[0]}`);
}

// ============ Model Comparison Export ============

export function exportModelComparisonData(data: ModelComparisonData[]): void {
  const exportData = data.map((item) => ({
    Model: item.model,
    'Visibility Score': item.visibility,
    'Citation Score': item.citation,
    'Representation Score': item.representation,
    'Intent Score': item.intent,
    'Composite Score': item.composite,
  }));

  const csv = toCSV(exportData);
  downloadCSV(csv, `geo-insights-model-comparison-${new Date().toISOString().split('T')[0]}`);
}

// ============ Heatmap Export ============

export function exportHeatmapData(data: HeatmapCell[]): void {
  const exportData = data.map((cell) => ({
    Brand: cell.brand,
    Model: cell.model,
    Score: cell.score,
  }));

  const csv = toCSV(exportData);
  downloadCSV(csv, `geo-insights-heatmap-${new Date().toISOString().split('T')[0]}`);
}

// ============ PNG Export ============

/**
 * Export a DOM element as PNG image.
 * Requires html2canvas library.
 */
export async function exportToPNG(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default;

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher quality
    logging: false,
    useCORS: true,
  });

  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ============ PDF Export ============

/**
 * Generate a simple PDF report.
 * Note: For more complex PDFs, consider using libraries like jsPDF or react-pdf.
 */
export function exportToPDF(
  title: string,
  data: BrandWithScore[],
  filename: string
): void {
  // Create a printable HTML document
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to export PDF');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 {
          color: #1e293b;
          border-bottom: 2px solid #8b5cf6;
          padding-bottom: 10px;
        }
        .meta {
          color: #64748b;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
        }
        tr:hover {
          background: #f8fafc;
        }
        .score {
          font-weight: 600;
        }
        .score.excellent { color: #10b981; }
        .score.good { color: #3b82f6; }
        .score.average { color: #f59e0b; }
        .score.poor { color: #ef4444; }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <h1>GEO Insights Report: ${title}</h1>
      <div class="meta">
        Generated on ${new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
      <table>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Category</th>
            <th>Composite</th>
            <th>Visibility</th>
            <th>Citation</th>
            <th>Representation</th>
            <th>Intent</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map((brand) => {
              const score = brand.score?.composite_score ?? 0;
              const level =
                score >= 80
                  ? 'excellent'
                  : score >= 65
                  ? 'good'
                  : score >= 50
                  ? 'average'
                  : 'poor';
              return `
                <tr>
                  <td><strong>${brand.name}</strong></td>
                  <td>${brand.category}</td>
                  <td class="score ${level}">${brand.score?.composite_score ?? 'N/A'}</td>
                  <td>${brand.score?.visibility_score ?? 'N/A'}</td>
                  <td>${brand.score?.citation_score ?? 'N/A'}</td>
                  <td>${brand.score?.representation_score ?? 'N/A'}</td>
                  <td>${brand.score?.intent_score ?? 'N/A'}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// ============ JSON Export ============

export function exportToJSON<T>(data: T, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ============ Generic Export Functions ============

/**
 * Generic CSV export function.
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void {
  const csv = toCSV(data, columns);
  downloadCSV(csv, filename);
}

/**
 * Format chart data for CSV export.
 */
export function formatChartDataForCSV(
  data: Record<string, unknown>[],
  chartType: string
): Record<string, unknown>[] {
  return data.map((item, index) => ({
    index: index + 1,
    ...item,
    chartType,
    exportedAt: new Date().toISOString(),
  }));
}
