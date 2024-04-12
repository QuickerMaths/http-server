import path from 'path'

const root = `${__dirname}/www/`;

export const validatePath = (input: string) => {
    if (input.indexOf('\0') !== -1) {
        throw Error('Access denied')
    }
    if (!/^[a-z0-9]+$/.test(input)) {
        throw Error('Access denied')
    }

    const safe_input = path.normalize(input).replace(/^(\.\.(\/|\\|$))+/, '');
    const path_string = path.join(root, safe_input);

    if (path_string.indexOf(root) !== 0) {
        throw Error('Access denied')
    }

    return `${path_string}.html`;
}