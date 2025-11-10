import { http, HttpResponse } from 'msw';
import type { Profile } from '../../types';

// Mock profiles data
let mockProfiles: Profile[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        avatar: 'https://via.placeholder.com/100x100',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'editor',
        avatar: 'https://via.placeholder.com/100x100',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
    },
    {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        role: 'viewer',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
    },
];

export const profileHandlers = [
    // Get all profiles
    http.get('/api/profiles', ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
        const search = url.searchParams.get('search') || '';

        let filteredProfiles = mockProfiles;

        if (search) {
            filteredProfiles = filteredProfiles.filter(profile =>
                profile.name.toLowerCase().includes(search.toLowerCase()) ||
                profile.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex);

        return HttpResponse.json({
            data: paginatedProfiles,
            total: filteredProfiles.length,
            page,
            pageSize,
        });
    }),

    // Get single profile by ID
    http.get('/api/profiles/:id', ({ params }) => {
        const profile = mockProfiles.find(p => p.id === params.id);
        if (!profile) {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(profile);
    }),

    // Create new profile
    http.post('/api/profiles', async ({ request }) => {
        const data = await request.json() as Omit<Profile, 'id' | 'created_at' | 'updated_at'>;

        const newProfile: Profile = {
            ...data,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        mockProfiles.push(newProfile);
        return HttpResponse.json(newProfile, { status: 201 });
    }),

    // Update profile
    http.patch('/api/profiles/:id', async ({ params, request }) => {
        const data = await request.json() as Partial<Profile>;
        const profileIndex = mockProfiles.findIndex(p => p.id === params.id);

        if (profileIndex === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        const updatedProfile = {
            ...mockProfiles[profileIndex],
            ...data,
            updated_at: new Date().toISOString(),
        };

        mockProfiles[profileIndex] = updatedProfile;
        return HttpResponse.json(updatedProfile);
    }),

    // Delete profile
    http.delete('/api/profiles/:id', ({ params }) => {
        const profileIndex = mockProfiles.findIndex(p => p.id === params.id);

        if (profileIndex === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        mockProfiles.splice(profileIndex, 1);
        return HttpResponse.json({ success: true });
    }),
];