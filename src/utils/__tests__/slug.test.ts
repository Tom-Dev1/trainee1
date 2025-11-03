import { generateSlug, toSlug, isSlugUnique, generateUniqueSlug } from '../slug';

describe('Slug utilities', () => {
    describe('toSlug', () => {
        it('converts text to lowercase slug', () => {
            expect(toSlug('Hello World')).toBe('hello-world');
        });

        it('removes special characters', () => {
            expect(toSlug('Hello @#$ World!')).toBe('hello-world');
        });

        it('handles multiple spaces and hyphens', () => {
            expect(toSlug('Hello   ---   World')).toBe('hello-world');
        });

        it('trims leading and trailing hyphens', () => {
            expect(toSlug('---Hello World---')).toBe('hello-world');
        });

        it('handles Vietnamese characters', () => {
            expect(toSlug('Điện thoại thông minh')).toBe('dien-thoai-thong-minh');
            expect(toSlug('Máy tính xách tay')).toBe('may-tinh-xach-tay');
            expect(toSlug('Áo sơ mi')).toBe('ao-so-mi');
        });

        it('handles accented characters', () => {
            expect(toSlug('Café & Restaurant')).toBe('cafe-restaurant');
            expect(toSlug('Naïve résumé')).toBe('naive-resume');
        });
    });

    describe('generateSlug (legacy)', () => {
        it('works the same as toSlug', () => {
            expect(generateSlug('Hello World')).toBe('hello-world');
            expect(generateSlug('Điện thoại')).toBe('dien-thoai');
        });
    });

    describe('isSlugUnique', () => {
        const items = [
            { slug: 'existing-slug' },
            { slug: 'another-slug' },
        ];

        it('returns true for unique slug', () => {
            expect(isSlugUnique('new-slug', items)).toBe(true);
        });

        it('returns false for existing slug', () => {
            expect(isSlugUnique('existing-slug', items)).toBe(false);
        });

        it('excludes item with specific ID', () => {
            const itemsWithId = [
                { id: '1', slug: 'existing-slug' },
                { id: '2', slug: 'another-slug' },
            ];
            expect(isSlugUnique('existing-slug', itemsWithId, '1')).toBe(true);
        });
    });

    describe('generateUniqueSlug', () => {
        const items = [
            { slug: 'test-slug' },
            { slug: 'test-slug-1' },
        ];

        it('returns original slug if unique', () => {
            expect(generateUniqueSlug('New Product', items)).toBe('new-product');
        });

        it('appends number for duplicate slug', () => {
            expect(generateUniqueSlug('Test Slug', items)).toBe('test-slug-2');
        });
    });
});