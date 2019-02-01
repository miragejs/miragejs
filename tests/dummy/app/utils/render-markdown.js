import marked from 'marked';

/*
  TODO: This is copied from AddonDocs. Need to make an importable
  renderMarkdown function from AD that brings along highlighting.
*/
class AddonDocsRenderer extends marked.Renderer {
  constructor(config) {
    super();
    this.config = config || {};
  }

  codespan() {
    return this._processCode(super.codespan.apply(this, arguments));
  }

  code() {
    let code = this._processCode(super.code.apply(this, arguments));
    return code.replace(/^<pre>/, '<pre class="docs-md__code">');
  }

  // Unescape markdown escaping in general, since it can interfere with
  // Handlebars templating
  text() {
    let text = super.text.apply(this, arguments);
    if (this.config.targetHandlebars) {
      text = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;|&#34;/g, '"')
        .replace(/&apos;|&#39;/g, '\'');
    }
    return text;
  }

  // Escape curlies in code spans/blocks to avoid treating them as Handlebars
  _processCode(string) {
    if (this.config.targetHandlebars) {
      string = this._escapeCurlies(string);
    }

    return string;
  }

  _escapeCurlies(string) {
    return string
      .replace(/{{/g, '&#123;&#123;')
      .replace(/}}/g, '&#125;&#125;');
  }

  heading(text, level) {
    let id = text.toLowerCase().replace(/<\/?.*?>/g, '').replace(/[^\w]+/g, '-');
    let inner = level === 1 ? text : `<a href='#${id}' class='heading-anchor'>${text}</a>`;

    return `
      <h${level} id='${id}' class='docs-md__h${level}'>${inner}</h${level}>
    `;
  }

  hr() {
    return `<hr class='docs-md__hr'>`;
  }

  blockquote(text) {
    return `<blockquote class='docs-md__blockquote'>${text}</blockquote>`;
  }

  link(href, title, text) {
    let titleAttribute = title ? `title="${title}"` : '';
    return `<a href="${href}" ${titleAttribute} class="docs-md__a">${text}</a>`;
  }
}

let renderer = new AddonDocsRenderer();

marked.setOptions({
  renderer,
  headerIds: false
});

export default function(source) {
  return source ? marked(source) : source;
}
