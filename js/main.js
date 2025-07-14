document.addEventListener('DOMContentLoaded', function () {
    
    // --- BLOG PAGINATION LOGIC ---
    const postsPerPage = 3;
    const postsList = document.getElementById('posts-list');
    const blogPosts = postsList.querySelectorAll('.blog-post');
    const paginationContainer = document.getElementById('pagination-container');
    const totalPosts = blogPosts.length;

    if (totalPosts <= postsPerPage) {
        if(paginationContainer) paginationContainer.style.display = 'none';
    } else {
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        let currentPage = 1;

        function showPage(page) {
            currentPage = page;
            const startIndex = (page - 1) * postsPerPage;
            const endIndex = startIndex + postsPerPage;

            blogPosts.forEach((post, index) => {
                post.style.display = (index >= startIndex && index < endIndex) ? 'block' : 'none';
            });
            renderPaginationButtons();
        }

        function renderPaginationButtons() {
            paginationContainer.innerHTML = ''; // Clear old buttons

            const prevButton = document.createElement('button');
            prevButton.innerHTML = '&larr; Previous';
            prevButton.disabled = currentPage === 1;
            prevButton.className = 'bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed';
            prevButton.addEventListener('click', () => { if (currentPage > 1) showPage(currentPage - 1); });
            paginationContainer.appendChild(prevButton);

            const pageInfo = document.createElement('span');
            pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
            pageInfo.className = 'text-gray-400 px-2';
            paginationContainer.appendChild(pageInfo);

            const nextButton = document.createElement('button');
            nextButton.innerHTML = 'Next &rarr;';
            nextButton.disabled = currentPage === totalPages;
            nextButton.className = 'bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed';
            nextButton.addEventListener('click', () => { if (currentPage < totalPages) showPage(currentPage + 1); });
            paginationContainer.appendChild(nextButton);
        }

        showPage(1);
    }
    
    // --- KEY FEATURES MODAL LOGIC ---
    const keyFeaturesModal = document.getElementById('key-features-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const featureListContainer = document.getElementById('feature-list-container');
    const addFeatureForm = document.getElementById('add-feature-form');
    const keyFeaturesBtns = document.querySelectorAll('.key-features-btn');

    // New elements for view/edit modes
    const editFeaturesBtn = document.getElementById('edit-features-btn');
    const doneEditingBtn = document.getElementById('done-editing-btn');
    const viewModeFooter = document.getElementById('view-mode-footer');
    const editModeFooter = document.getElementById('edit-mode-footer');

    // New state for editing a feature
    const featureNameInput = document.getElementById('feature-name');
    const featureStartDateInput = document.getElementById('feature-start-date');
    const featureEndDateInput = document.getElementById('feature-end-date');
    const addFeatureFormSubmitBtn = addFeatureForm.querySelector('button[type="submit"]');

    let currentProject = null;
    let isInEditMode = false;
    let featureToEditId = null; // To track which feature is being edited

    function getFeatures(projectName) {
        return JSON.parse(localStorage.getItem(`features_${projectName}`)) || [];
    }

    function saveFeatures(projectName, features) {
        localStorage.setItem(`features_${projectName}`, JSON.stringify(features));
    }

    function renderFeatures(projectName) {
        const features = getFeatures(projectName);
        featureListContainer.innerHTML = '';
        if (features.length === 0 && !isInEditMode) {
            featureListContainer.innerHTML = `<p class="text-gray-400">No key features defined yet. Click 'Edit Features' to add some.</p>`;
            return;
        }

        features.forEach(feature => {
            const featureEl = document.createElement('div');
            const featureColor = feature.completed ? 'text-gray-400' : 'text-white';
            
            if (isInEditMode) {
                // Use a rigid 4-column CSS Grid layout to guarantee spacing and button separation
                featureEl.className = 'bg-gray-700 p-4 rounded-lg grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-4';
                featureEl.innerHTML = `
                    <!-- Column 1: Checkbox -->
                    <div class="flex-shrink-0">
                        <input type="checkbox" data-id="${feature.id}" class="form-checkbox h-5 w-5 bg-gray-900 border-gray-600 text-sky-500 focus:ring-sky-500" ${feature.completed ? 'checked' : ''}>
                    </div>

                    <!-- Column 2: Feature Text (stretches to fill space) -->
                    <div class="min-w-0">
                        <p class="font-bold ${featureColor}">${feature.name}</p>
                        <p class="text-sm text-gray-400">
                            ${feature.startDate} &rarr; ${feature.endDate}
                        </p>
                    </div>

                    <!-- Column 3: Edit Button -->
                    <div>
                        <button data-id="${feature.id}" class="edit-btn text-sky-500 hover:text-sky-400 font-bold">Edit</button>
                    </div>

                    <!-- Column 4: Delete Button -->
                    <div>
                        <button data-id="${feature.id}" class="delete-btn text-red-500 hover:text-red-400 font-bold">Delete</button>
                    </div>
                `;
            } else {
                // Keep the simple layout for view mode
                featureEl.className = 'bg-gray-700 p-4 rounded-lg';
                featureEl.innerHTML = `
                    <div class="min-w-0">
                        <p class="font-bold ${featureColor}">${feature.name}</p>
                        <p class="text-sm text-gray-400">
                            ${feature.startDate} &rarr; ${feature.endDate}
                        </p>
                    </div>
                `;
            }
            
            featureListContainer.appendChild(featureEl);
        });
    }
    
    function updateModalView() {
        if (isInEditMode) {
            viewModeFooter.classList.add('hidden');
            editModeFooter.classList.remove('hidden');
        } else {
            viewModeFooter.classList.remove('hidden');
            editModeFooter.classList.add('hidden');
        }
        // Re-render the feature list to show/hide buttons
        if (currentProject) {
            renderFeatures(currentProject);
        }
    }

    function openModal(projectName) {
        currentProject = projectName;
        modalTitle.innerText = `${currentProject} - Key Features`;
        isInEditMode = false; // Always open in view mode
        updateModalView();
        keyFeaturesModal.classList.remove('hidden');
        keyFeaturesModal.classList.add('flex');
    }

    function closeModal() {
        keyFeaturesModal.classList.add('hidden');
        keyFeaturesModal.classList.remove('flex');
        currentProject = null;
    }

    keyFeaturesBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const projectName = btn.dataset.project;
            openModal(projectName);
        });
    });

    closeModalBtn.addEventListener('click', closeModal);
    keyFeaturesModal.addEventListener('click', (e) => {
        if (e.target === keyFeaturesModal) closeModal();
    });

    editFeaturesBtn.addEventListener('click', () => {
        isInEditMode = true;
        updateModalView();
    });

    doneEditingBtn.addEventListener('click', () => {
        isInEditMode = false;
        featureToEditId = null; // Reset edit state
        addFeatureForm.reset(); // Clear form
        addFeatureFormSubmitBtn.innerText = 'Add Feature'; // Reset button text
        updateModalView();
    });

    addFeatureForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = featureNameInput.value;
        const startDate = featureStartDateInput.value;
        const endDate = featureEndDateInput.value;

        if (!name || !startDate || !endDate) {
            alert('Please fill out all fields.');
            return;
        }

        let features = getFeatures(currentProject);

        if (featureToEditId !== null) {
            // We are updating an existing feature
            features = features.map(f => f.id === featureToEditId ? { ...f, name, startDate, endDate } : f);
        } else {
            // We are adding a new feature
            const newFeature = {
                id: Date.now(),
                name,
                startDate,
                endDate,
                completed: false
            };
            features.push(newFeature);
        }
        
        saveFeatures(currentProject, features);
        renderFeatures(currentProject);
        addFeatureForm.reset();
        addFeatureFormSubmitBtn.innerText = 'Add Feature';
        featureToEditId = null;
    });

    featureListContainer.addEventListener('click', (e) => {
        if (!isInEditMode) return; // Only allow actions in edit mode

        const id = parseInt(e.target.dataset.id, 10);
        if (!id) return;

        let features = getFeatures(currentProject);

        if (e.target.type === 'checkbox') {
            features = features.map(f => f.id === id ? { ...f, completed: !f.completed } : f);
        } else if (e.target.classList.contains('delete-btn')) {
            features = features.filter(f => f.id !== id);
        } else if (e.target.classList.contains('edit-btn')) {
            const featureToEdit = features.find(f => f.id === id);
            if (featureToEdit) {
                featureToEditId = id;
                featureNameInput.value = featureToEdit.name;
                featureStartDateInput.value = featureToEdit.startDate;
                featureEndDateInput.value = featureToEdit.endDate;
                addFeatureFormSubmitBtn.innerText = 'Update Feature';
                addFeatureForm.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }
        
        saveFeatures(currentProject, features);
        renderFeatures(currentProject);
    });

    // --- PROJECT TIMELINE MODAL LOGIC ---
    // Ensure Mermaid is loaded before you initialize it
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    }

    const timelineModal = document.getElementById('project-timeline-modal');
    const closeTimelineModalBtn = document.getElementById('close-timeline-modal-btn');
    const timelineModalTitle = document.getElementById('timeline-modal-title');
    const timelineContainer = document.getElementById('timeline-container');
    const projectTimelineBtns = document.querySelectorAll('.project-timeline-btn');

    async function openTimelineModal(projectName) {
        timelineModalTitle.innerText = `${projectName} - Timeline`;
        const features = getFeatures(projectName);
        const timelineTooltip = document.getElementById('timeline-tooltip');
        
        // Define the Gantt chart structure with a single section to hold all tasks.
        // This avoids the list of labels on the left.
        let ganttChart = `
gantt
    dateFormat  YYYY-MM-DD
    title       Project Timeline
    axisFormat  %Y-%m-%d
    tickInterval 1week
section Tasks
`;

        if (features.length > 0) {
            features.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            
            features.forEach(feature => {
                const state = feature.completed ? 'done' : 'active';
                // The task title is required for syntax but will be hidden.
                ganttChart += `
    ${feature.name.replace(/:/g, '')} :${state}, task${feature.id}, ${feature.startDate}, ${feature.endDate}`;
            });
        } else {
            const today = new Date().toISOString().slice(0, 10);
            ganttChart += `
    Define key features :done, task_init, ${today}, 1d`;
        }

        timelineContainer.innerHTML = ''; // Clear previous chart

        if (typeof mermaid !== 'undefined') {
            try {
                const { svg, bindFunctions } = await mermaid.render(`gantt-chart-${projectName}-${Date.now()}`, ganttChart);
                
                // Inject styles to hide all text elements within the chart for a clean look.
                const style = `<style>.section > text, .taskText { display: none; }</style>`;
                const styledSvg = svg.replace('>', `>${style}`);

                timelineContainer.innerHTML = styledSvg;

                if (bindFunctions) {
                    bindFunctions(timelineContainer);
                }

                // Force a wider chart for horizontal scrolling
                const svgEl = timelineContainer.querySelector('svg');
                if (svgEl) {
                    svgEl.style.width = '1600px'; 
                }

                const featureMap = new Map(features.map(f => [`task${f.id}`, f]));
                const taskRects = timelineContainer.querySelectorAll('.task');

                taskRects.forEach(rect => {
                    const taskId = rect.id;
                    const feature = featureMap.get(taskId);
                    
                    if (feature) {
                        const modalBody = timelineModal.querySelector('.bg-gray-800');
                        rect.addEventListener('mousemove', (e) => {
                            const modalRect = modalBody.getBoundingClientRect();
                            timelineTooltip.classList.remove('hidden');
                            timelineTooltip.style.left = `${e.clientX - modalRect.left + 15}px`;
                            timelineTooltip.style.top = `${e.clientY - modalRect.top + 15}px`;
                            timelineTooltip.innerHTML = `
                                <div class="font-bold">${feature.name}</div>
                                <div class="text-gray-400">${feature.startDate} &rarr; ${feature.endDate}</div>
                            `;
                        });

                        rect.addEventListener('mouseout', () => {
                            timelineTooltip.classList.add('hidden');
                        });
                    }
                });

            } catch (error) {
                console.error("Mermaid rendering failed:", error);
                timelineContainer.innerHTML = `<p class="text-red-500">Error rendering timeline. Check features for correct dates.</p>`;
            }
        }

        timelineModal.classList.remove('hidden');
        timelineModal.classList.add('flex');
    }

    function closeTimelineModal() {
        timelineModal.classList.add('hidden');
        timelineModal.classList.remove('flex');
        timelineContainer.innerHTML = '';
    }

    projectTimelineBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const projectName = btn.dataset.project;
            openTimelineModal(projectName);
        });
    });

    closeTimelineModalBtn.addEventListener('click', closeTimelineModal);
    timelineModal.addEventListener('click', (e) => {
        if (e.target === timelineModal) {
            closeTimelineModal();
        }
    });
});

const sections = document.querySelectorAll('.fade-in-section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, { threshold: 0.1 });
sections.forEach(section => { observer.observe(section); }); 