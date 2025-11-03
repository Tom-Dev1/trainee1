// Vietnamese-friendly slug generation
const removeAccents = (str: string): string => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

export const toSlug = (text: string): string => {
    return removeAccents(text)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

// Legacy function for backward compatibility
export const generateSlug = toSlug;

export const isSlugUnique = (slug: string, items: Array<{ slug: string }>, excludeId?: string): boolean => {
    return !items.some(item => item.slug === slug && (!excludeId || (item as any).id !== excludeId));
};

export const generateUniqueSlug = (text: string, items: Array<{ slug: string }>, excludeId?: string): string => {
    let baseSlug = generateSlug(text);
    let slug = baseSlug;
    let counter = 1;

    while (!isSlugUnique(slug, items, excludeId)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
};