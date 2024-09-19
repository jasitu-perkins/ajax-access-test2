import { performAccessibilityChecks } from './jf_access.js';

export function onDocumentReady() {
    const forms = document.querySelectorAll('.jotform-form');

    if (forms.length > 0) {
        forms.forEach(handleFormSubmit);
    }

    function handleFormSubmit(form) {
        form.addEventListener('submit', handleSubmit.bind(null, form));
    }

    async function handleSubmit(form, event) {
        event.preventDefault();

        // Perform accessibility checks before proceeding
        if (!performAccessibilityChecks()) {
            return;
        }

        const formData = new FormData(form);
        const submissionUrl = form.action;

        try {
            const response = await fetch(submissionUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const html = await response.text();
            parseHtmlAndReplaceForm(html, form);
        } catch (error) {
            handleError(form, error.message);
        }
    }

    function handleError(form, message) {
        console.error(message);
        form.innerHTML = `<p>${message}</p>`;
    }

    function parseHtmlAndReplaceForm(html, form) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const divElement = document.createElement('div');

        Array.from(doc.body.attributes).forEach(attr => {
            divElement.setAttribute(attr.name, attr.value);
        });

        divElement.innerHTML = doc.body.innerHTML;
        form.parentNode.replaceChild(divElement, form);
    }

    function addCssFromInlineString(css) {
        const head = document.getElementsByTagName('head')[0];
        const s = document.createElement('style');
        s.setAttribute('type', 'text/css');
        if (s.styleSheet) {
            s.styleSheet.cssText = css;
        } else {
            s.appendChild(document.createTextNode(css));
        }
        head.appendChild(s);
    }
}

document.addEventListener('DOMContentLoaded', onDocumentReady);
