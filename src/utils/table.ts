import { Tokens } from "marked";
import { pdfMakeText } from "./text";

export const pdfMakeTable = async (
  token: Tokens.Table | Tokens.Generic,
  content: any[],
  push: boolean = true
) => {
  // Process a single cell and return its content
  const processCell = async (cell: any, align: "left" | "center" | "right" | null) => {
    const cellFragments: any[] = [];

    // Process tokens within the cell (bold, italic, links, etc.)
    if (cell.tokens && cell.tokens.length > 0) {
      for (const cellToken of cell.tokens) {
        const textContent = await pdfMakeText(cellToken, [], false);
        cellFragments.push(...textContent);
      }
    } else {
      // Fallback to plain text if no tokens
      cellFragments.push({ text: cell.text || "" });
    }

    // Build the cell object with alignment
    const cellObject: any = {
      text: cellFragments.length > 0 ? cellFragments : "",
    };

    // Apply alignment if specified
    if (align) {
      cellObject.alignment = align;
    }

    return cellObject;
  };

  // Build the table body (header + rows)
  const tableBody: any[][] = [];

  // Process header row
  const headerRow: any[] = [];
  for (let i = 0; i < token.header.length; i++) {
    const headerCell = token.header[i];
    const align = token.align[i];
    const cellContent = await processCell(headerCell, align);
    
    // Make header cells bold
    headerRow.push({
      ...cellContent,
      bold: true,
    });
  }
  tableBody.push(headerRow);

  // Process data rows
  for (const row of token.rows) {
    const dataRow: any[] = [];
    for (let i = 0; i < row.length; i++) {
      const cell = row[i];
      const align = token.align[i];
      const cellContent = await processCell(cell, align);
      dataRow.push(cellContent);
    }
    tableBody.push(dataRow);
  }

  // Create the PDFMake table structure
  const tableStructure = {
    table: {
      headerRows: 1,
      widths: Array(token.header.length).fill("auto"),
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => "#cccccc",
      vLineColor: () => "#cccccc",
    },
    margin: [0, 5, 0, 5],
  };

  if (push) {
    content.push(tableStructure);
  }

  return tableStructure;
};
