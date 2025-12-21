import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageOrientation } from 'docx';
import { saveAs } from 'file-saver';
import { Document, Template } from '../types';

/**
 * Generates a DOCX file from our internal Document structure using the selected Template styles.
 */
export const generateDocx = async (doc: Document, template: Template) => {
  const sections = [];

  // Helper to map alignment string to docx AlignmentType
  const getAlignment = (align: string) => {
    switch (align) {
      case 'center': return AlignmentType.CENTER;
      case 'right': return AlignmentType.RIGHT;
      case 'justify': return AlignmentType.JUSTIFIED;
      default: return AlignmentType.LEFT;
    }
  };

  // Convert our internal sections to Docx Paragraphs
  const docxChildren = doc.sections.map(section => {
    let style = template.styles.body;
    let headingLevel = undefined;

    if (section.type === 'h1') {
      style = template.styles.h1;
      headingLevel = HeadingLevel.HEADING_1;
    } else if (section.type === 'h2') {
      style = template.styles.h2;
      headingLevel = HeadingLevel.HEADING_2;
    } else if (section.type === 'h3') {
      style = template.styles.h3;
      headingLevel = HeadingLevel.HEADING_3;
    }

    return new Paragraph({
      alignment: getAlignment(style.alignment),
      heading: headingLevel,
      spacing: {
        line: style.spacing ? style.spacing * 240 : 240, // 240 = 1.0 spacing
        after: 200, // Space after paragraph
      },
      children: [
        new TextRun({
          text: style.uppercase ? section.content.toUpperCase() : section.content,
          bold: style.bold,
          italics: style.italic,
          font: style.family,
          size: style.size * 2, // docx uses half-points
          color: style.color.replace('#', ''),
        }),
      ],
    });
  });

  // Create the document
  const docx = new DocxDocument({
    styles: {
        default: {
            document: {
                run: {
                    font: template.styles.body.family,
                    size: template.styles.body.size * 2,
                    color: template.styles.body.color.replace('#', ''),
                }
            }
        }
    },
    sections: [
      {
        properties: {
          page: {
            size: {
                orientation: template.layout.orientation === 'landscape' ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
            },
            margin: {
              top: template.layout.marginTop * 1440, // 1440 twips = 1 inch
              bottom: template.layout.marginBottom * 1440,
              left: template.layout.marginLeft * 1440,
              right: template.layout.marginRight * 1440,
            },
          },
          column: {
            count: template.layout.columns,
            space: 708, // 0.5 inch space between columns
          }
        },
        children: docxChildren,
      },
    ],
  });

  // Generate and save
  const blob = await Packer.toBlob(docx);
  saveAs(blob, `${doc.title.replace(/\s+/g, '_')}_formatted.docx`);
};

/**
 * Generates a Plain Text file (.txt)
 */
export const generateTxt = (doc: Document) => {
  const content = doc.sections.map(s => s.content).join('\n\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${doc.title.replace(/\s+/g, '_')}.txt`);
};

/**
 * Generates a Markdown file (.md)
 */
export const generateMd = (doc: Document) => {
  const content = doc.sections.map(s => {
    switch (s.type) {
      case 'h1': return `# ${s.content}`;
      case 'h2': return `## ${s.content}`;
      case 'h3': return `### ${s.content}`;
      default: return s.content;
    }
  }).join('\n\n');
  
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${doc.title.replace(/\s+/g, '_')}.md`);
};
