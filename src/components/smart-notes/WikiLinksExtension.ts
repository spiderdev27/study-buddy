import { Extension } from '@tiptap/core';

// Custom extension for wiki-style links
export const WikiLinksExtension = Extension.create({
  name: 'wikiLinks',
  
  addPasteRules() {
    return [
      {
        find: /\[\[(.*?)\]\]/g,
        handler: ({ state, range, match }) => {
          const linkText = match[1];
          const { tr } = state;
          
          tr.insertText(`[[${linkText}]]`, range.from, range.to);
          return true;
        }
      }
    ];
  },
});

export default WikiLinksExtension; 