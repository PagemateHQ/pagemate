import sanitizeHtml from 'sanitize-html';

export function stripJunk(html: string) {
  return sanitizeHtml(html, {
    // keep only basic semantic elements (adjust as you like)
    allowedTags: [
      'p',
      'ul',
      'ol',
      'li',
      'a',
      'strong',
      'em',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
      'img',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel', 'aria-label', 'aria-describedby'],
      img: ['src', 'alt'],
      button: ['aria-label', 'aria-describedby'],
      input: ['aria-label', 'aria-describedby'],
      textarea: ['aria-label', 'aria-describedby'],
      select: ['aria-label', 'aria-describedby'],
      option: ['aria-label', 'aria-describedby'],
      label: ['aria-label', 'aria-describedby'],
      span: ['aria-label', 'aria-describedby'],
      div: ['aria-label', 'aria-describedby'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    // remove *all* styling/identifiers:
    allowedStyles: {},
    allowedClasses: {},
    // forbid common junky/unsafe tags outright
    disallowedTagsMode: 'discard',
  });
}
