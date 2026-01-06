/**
 * DataUtility Documentation - JavaScript
 * Handles all interactive functionality including search, navigation, and animations
 */

// ============================================================================
// Data
// ============================================================================

const sections = [
    {
        id: 'overview',
        title: 'Overview',
        description: 'What DataUtility is and why it exists',
        tags: ['intro', 'overview'],
        content: 'DataUtility is a lightweight, modular Python utility library built on top of pandas to simplify data cleaning, exploration (EDA), and preprocessing. You use one class: DataTools. Internally, methods are organized into modules.',
        subsections: [
            {
                title: 'Why this library exists',
                content: 'Most projects repeat the same tasks: inspect datasets, handle missing values, remove duplicates, detect outliers, encode categories, scale numeric features, and create derived features. DataUtility keeps these steps consistent and reusable.'
            },
            {
                title: 'What "safe" means here',
                content: 'Methods validate columns and types, avoid silent behavior, and support inplace=True/False so you choose between modifying dt.df or returning a copy.'
            }
        ]
    },
    {
        id: 'quickstart',
        title: 'Quick Start',
        description: 'Install requirements and create your first DataTools instance',
        tags: ['install', 'import', 'quickstart'],
        content: 'Get started with DataUtility in just a few steps. Install pandas and numpy, then import DataTools and create your first instance.',
        subsections: [
            {
                title: '1) Install',
                content: 'pip install pandas numpy',
                isCode: true
            },
            {
                title: '2) Import + create DataTools',
                content: `import pandas as pd
from data_utility import DataTools

df = pd.read_csv("data.csv")
dt = DataTools(df)`,
                isCode: true
            }
        ]
    },
    {
        id: 'structure',
        title: 'Project Structure',
        description: 'Modular files combined into one DataTools class',
        tags: ['structure', 'modules', 'package'],
        content: 'The DataUtility package is organized into focused modules, each handling a specific aspect of data processing. All modules are unified through the main DataTools class.'
    },
    {
        id: 'design',
        title: 'Design Principles',
        description: 'Consistency rules used across every method',
        tags: ['design', 'principles', 'validation'],
        content: 'DataUtility follows strict design principles to ensure predictable, safe behavior across all methods.'
    },
    {
        id: 'missing',
        title: 'Missing and Duplicates',
        description: 'Fill or drop missing values and duplicates',
        tags: ['missing', 'duplicates', 'cleaning'],
        content: 'Handle missing values and duplicate rows with flexible, safe methods that give you control over the operation.'
    },
    {
        id: 'outliers',
        title: 'Outliers',
        description: 'Detect and handle outliers using IQR and Z-score',
        tags: ['outliers', 'detection', 'iqr', 'zscore'],
        content: 'Identify and manage outliers in your data using industry-standard statistical methods.'
    },
    {
        id: 'encoding',
        title: 'Encoding',
        description: 'Categorical encoding with oneHotEncode()',
        tags: ['encoding', 'categorical', 'onehot'],
        content: 'Convert categorical variables into numeric representations suitable for machine learning models.'
    },
    {
        id: 'scaling',
        title: 'Scaling',
        description: 'Normalize and scale numeric features',
        tags: ['scaling', 'normalization', 'standardization'],
        content: 'Scale numeric features to a standard range for improved model performance.'
    },
    {
        id: 'features',
        title: 'Feature Engineering',
        description: 'Create derived features with combineFeatures()',
        tags: ['features', 'engineering', 'derivation'],
        content: 'Generate new features from existing ones to improve model predictive power.'
    },
    {
        id: 'text',
        title: 'Text Cleaning',
        description: 'Clean and preprocess text data',
        tags: ['text', 'cleaning', 'preprocessing'],
        content: 'Prepare text data for analysis with comprehensive cleaning utilities.'
    },
    {
        id: 'types',
        title: 'Type Conversion',
        description: 'Convert between data types safely',
        tags: ['types', 'conversion', 'datetime'],
        content: 'Transform data types with validation and error handling.'
    },
    {
        id: 'license',
        title: 'License and Author',
        description: 'Educational and personal use',
        tags: ['license', 'author'],
        content: 'DataUtility is available for educational and personal use. Author: Ammar Yaser Al-Haroun (AI and Data Science Student).'
    }
];

// ============================================================================
// DOM Elements
// ============================================================================

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const closeSidebar = document.getElementById('closeSidebar');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const expandBtn = document.getElementById('expandBtn');
const collapseBtn = document.getElementById('collapseBtn');
const sectionsContainer = document.getElementById('sectionsContainer');
const navMenu = document.getElementById('navMenu');
const tagsContainer = document.getElementById('tagsContainer');
const fab = document.getElementById('fab');
const emptyState = document.getElementById('emptyState');
const emptyStateText = document.getElementById('emptyStateText');

// ============================================================================
// State
// ============================================================================

let expandedSections = new Set(['overview']);
let filteredSections = [...sections];
let currentSearchQuery = '';

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    renderNavigation();
    renderTags();
    renderSections();
    setupEventListeners();
});

// ============================================================================
// Event Listeners
// ============================================================================

function setupEventListeners() {
    // Menu toggle
    menuToggle.addEventListener('click', toggleSidebar);
    closeSidebar.addEventListener('click', closeSidebarMenu);
    overlay.addEventListener('click', closeSidebarMenu);

    // Search
    searchInput.addEventListener('input', handleSearch);
    clearSearch.addEventListener('click', clearSearchInput);
    clearSearchBtn.addEventListener('click', clearSearchInput);

    // Expand/Collapse
    expandBtn.addEventListener('click', expandAll);
    collapseBtn.addEventListener('click', collapseAll);

    // FAB
    fab.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', handleScroll);

    // Navigation items
    document.addEventListener('click', (e) => {
        if (e.target.closest('.nav-item')) {
            const navItem = e.target.closest('.nav-item');
            const sectionId = navItem.dataset.sectionId;
            const section = sections.find(s => s.id === sectionId);
            if (section) {
                expandedSections.add(sectionId);
                renderSections();
                closeSidebarMenu();
                setTimeout(() => {
                    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    });

    // Section headers
    document.addEventListener('click', (e) => {
        const sectionHeader = e.target.closest('.section-header');
        if (sectionHeader) {
            const section = sectionHeader.closest('.section');
            const sectionId = section.dataset.sectionId;
            toggleSection(sectionId);
        }
    });

    // Tags
    document.addEventListener('click', (e) => {
        if (e.target.closest('.tag-item')) {
            const tag = e.target.closest('.tag-item').textContent.trim();
            searchInput.value = tag;
            handleSearch();
        }
    });

    // Tag buttons in sidebar
    document.addEventListener('click', (e) => {
        if (e.target.closest('.tag')) {
            const tag = e.target.closest('.tag').textContent.trim();
            searchInput.value = tag;
            handleSearch();
            closeSidebarMenu();
        }
    });
}

// ============================================================================
// Sidebar Functions
// ============================================================================

function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

function closeSidebarMenu() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    menuToggle.classList.remove('active');
}

// ============================================================================
// Search Functions
// ============================================================================

function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    currentSearchQuery = query;

    if (!query) {
        filteredSections = [...sections];
        expandedSections = new Set(['overview']);
    } else {
        filteredSections = sections.filter(section =>
            section.title.toLowerCase().includes(query) ||
            section.description.toLowerCase().includes(query) ||
            section.tags.some(tag => tag.toLowerCase().includes(query)) ||
            section.content.toLowerCase().includes(query)
        );

        // Auto-expand matching sections
        expandedSections = new Set(filteredSections.map(s => s.id));
    }

    // Update clear button visibility
    clearSearch.classList.toggle('visible', query.length > 0);

    renderSections();
}

function clearSearchInput() {
    searchInput.value = '';
    currentSearchQuery = '';
    clearSearch.classList.remove('visible');
    filteredSections = [...sections];
    expandedSections = new Set(['overview']);
    renderSections();
    searchInput.focus();
}

// ============================================================================
// Section Functions
// ============================================================================

function toggleSection(sectionId) {
    if (expandedSections.has(sectionId)) {
        expandedSections.delete(sectionId);
    } else {
        expandedSections.add(sectionId);
    }
    renderSections();
}

function expandAll() {
    expandedSections = new Set(filteredSections.map(s => s.id));
    renderSections();
}

function collapseAll() {
    expandedSections.clear();
    renderSections();
}

// ============================================================================
// Rendering Functions
// ============================================================================

function renderNavigation() {
    navMenu.innerHTML = sections.map(section => `
        <div class="nav-item ${expandedSections.has(section.id) ? 'active' : ''}" data-section-id="${section.id}">
            <div class="nav-item-title">${section.title}</div>
            <div class="nav-item-desc">${section.description}</div>
        </div>
    `).join('');
}

function renderTags() {
    const allTags = [...new Set(sections.flatMap(s => s.tags))];
    tagsContainer.innerHTML = allTags.map(tag => `
        <button class="tag">${tag}</button>
    `).join('');
}

function renderSections() {
    if (filteredSections.length === 0) {
        sectionsContainer.innerHTML = '';
        emptyState.style.display = 'block';
        emptyStateText.textContent = `No sections found matching "${currentSearchQuery}"`;
        return;
    }

    emptyState.style.display = 'none';

    sectionsContainer.innerHTML = filteredSections.map(section => `
        <div class="section ${expandedSections.has(section.id) ? 'expanded' : ''}" data-section-id="${section.id}">
            <div class="section-header">
                <div class="section-title-group">
                    <div class="section-title">${section.title}</div>
                    <div class="section-desc">${section.description}</div>
                </div>
                <div class="section-chevron">⌄</div>
            </div>

            <div class="section-content">
                <div class="section-body">
                    <p>${section.content}</p>

                    ${section.subsections ? `
                        <div class="subsections">
                            ${section.subsections.map(sub => `
                                <div class="section-subsection">
                                    <div class="subsection-title">${sub.title}</div>
                                    <div class="subsection-content">
                                        ${sub.isCode ? `<pre class="code-block"><code>${escapeHtml(sub.content)}</code></pre>` : sub.content}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div class="tags">
                        ${section.tags.map(tag => `<span class="tag-item">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        const sectionId = item.dataset.sectionId;
        item.classList.toggle('active', expandedSections.has(sectionId));
    });
}

// ============================================================================
// Scroll Functions
// ============================================================================

function handleScroll() {
    const scrollPosition = window.scrollY;

    // Show/hide FAB
    if (scrollPosition > 300) {
        fab.classList.add('show');
    } else {
        fab.classList.remove('show');
    }

    // Update active navigation based on scroll
    updateActiveNavigation();
}

function updateActiveNavigation() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
            const elementTop = element.offsetTop;
            const elementBottom = elementTop + element.offsetHeight;

            if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                const navItem = document.querySelector(`[data-section-id="${section.id}"]`);
                if (navItem) {
                    navItem.classList.add('active');
                }
            }
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================================================
// Utility Functions
// ============================================================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }

    // Escape to close sidebar
    if (e.key === 'Escape') {
        closeSidebarMenu();
    }
});
