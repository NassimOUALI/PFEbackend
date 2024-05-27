const { v4: uuidv4 } = require('uuid');

function generateUniqueFilename(originalFilename) {
    const uniqueId = uuidv4();
    const parts = originalFilename.split('.');
    const extension = parts.pop();
    const baseName = parts.join('.');
    return `${baseName}_${uniqueId}.${extension}`;
}

module.exports = {
    generateUniqueFilename
};
