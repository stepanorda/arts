import Quill from 'quill';


const toolbarOptions = [
    { header: [2, false] },
    'bold',
    'italic',
    'link',
    'blockquote',
    { list: 'ordered' }
];

export function initializeQuill(editor) {
    return new Quill(editor, {
        modules: {
            toolbar: toolbarOptions
        },
        placeholder: 'Tell your story...',
        theme: 'bubble'
    });
}