const api = new Figma.Api({ personalAccessToken: '*PAT*' });

function findComponentsByName(components, searchString) {
    const matchingComponents = {};
    
    for (const [key, component] of Object.entries(components)) {
        if (component.name && component.name.toLowerCase().includes(searchString.toLowerCase())) {
            matchingComponents[key] = component;
        }
    }
    
    return matchingComponents;
}

// Get the Easel components
api.getFile({ file_key: 'IzcoLf3zv0AQuLc0KkvJBA'}).then((file) => {
    const searchTerm = "easel";
    const matchingComponents = findComponentsByName(file.components, searchTerm);
    
    console.log(`\nComponents containing "${searchTerm}":`, matchingComponents);
    console.log(`Found ${Object.keys(matchingComponents).length} matching components`);

    const componentIds = Object.keys(matchingComponents);
    console.log('Component IDs:', componentIds);
    console.log('Component IDs length:', componentIds.length);
    console.log('First component ID:', componentIds[0]);
    
    if (componentIds.length === 0) {
        console.log('No matching components found, skipping image fetch');
        return;
    }
    
    // Debug: Let's see what we're actually passing
    const imageParams = { 
        file_key: 'IzcoLf3zv0AQuLc0KkvJBA', 
        ids: componentIds.join(','), // Join IDs with comma as string
        format: 'png'
    };
    console.log('Image API params:', imageParams);
    
    // Try to get images for these component IDs
    return api.getImages({ file_key: 'IzcoLf3zv0AQuLc0KkvJBA'} , {ids: imageParams.ids }).then((images) => {
        console.log('Images:', images);
    }).catch((error) => {
        console.error('Error fetching images:', error);
        console.error('Error details:', error.response?.data || error.message);
    });
}).catch((error) => {
    console.error('Error fetching file:', error);
});