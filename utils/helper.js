const slugify = (str) => {
    // Convert string to lowercase
    str = str.toLowerCase();

    // Remove special characters and replace spaces with hyphens
    str = str
        .replace(/[^a-z0-9\s-]/g, '') // Remove all non-alphanumeric characters except spaces and hyphens
        .trim() // Remove leading and trailing whitespace
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen

    return str;
}

module.exports = slugify;