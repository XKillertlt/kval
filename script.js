const galleryEl = document.getElementById('gallery');
const categoryFilterEl = document.getElementById('category');
const searchFilterEl = document.getElementById('search');
const applyFilterBtn = document.getElementById('apply-filter');
const sortRatingBtn = document.getElementById('sort-rating');
const totalImagesEl = document.getElementById('total-images');
const avgRatingEl = document.getElementById('avg-rating');
const modalEl = document.getElementById('modal');
const modalTitleEl = document.getElementById('modal-title');
const modalCategoryEl = document.getElementById('modal-category');
const modalRatingEl = document.getElementById('modal-rating');
const modalUrlEl = document.getElementById('modal-url');
const modalImgEl = document.getElementById('modal-img');
const closeModalEl = document.querySelector('.close-modal');

let images = [];
let currentImages = [];
let sortDirection = 'asc';

function formatRating(rating) {
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    return `${stars} ${rating.toFixed(1)}`;
}

function calculateAvgRating(images) {
    if (images.length === 0) return 0;
    const total = images.reduce((sum, image) => sum + image.rating, 0);
    return total / images.length;
}

function displayStats(images) {
    totalImagesEl.textContent = images.length;
    avgRatingEl.textContent = calculateAvgRating(images).toFixed(1);
}

function displayGallery(images) {
    galleryEl.innerHTML = '';
    
    if (images.length === 0) {
        galleryEl.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i> Изображения не найдены. Попробуйте изменить фильтры.</div>';
        return;
    }
    
    images.forEach((image, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-img" style="background-image: url(${image.url})">
            </div>
            <div class="card-content">
                <h3 class="card-title">${image.title}</h3>
                <div class="card-category">${image.category}</div>
                <div class="card-rating">
                    <i class="fas fa-star"></i>${image.rating.toFixed(1)}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            showImageDetails(image);
        });
        
        galleryEl.appendChild(card);
    });
}

function showImageDetails(image) {
    modalTitleEl.textContent = image.title;
    modalCategoryEl.textContent = image.category;
    modalRatingEl.innerHTML = `<i class="fas fa-star"></i> Рейтинг: ${formatRating(image.rating)}`;
    modalUrlEl.textContent = image.url;
    modalImgEl.style.backgroundImage = `url(${image.url})`;
    modalEl.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function filterImages() {
    const category = categoryFilterEl.value;
    const searchTerm = searchFilterEl.value.toLowerCase();
    
    let filtered = [...images];
    
    if (category) {
        filtered = filtered.filter(image => image.category === category);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(image => 
            image.title.toLowerCase().includes(searchTerm)
        );
    }
    
    filtered.sort((a, b) => {
        if (sortDirection === 'asc') {
            return a.rating - b.rating;
        } else {
            return b.rating - a.rating;
        }
    });
    
    currentImages = filtered;
    displayGallery(currentImages);
    displayStats(currentImages);
}

function loadImages() {
    galleryEl.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner"></i>
            Загрузка данных...
        </div>
    `;
    
    fetch('images.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            images = data;
            currentImages = [...images];
            displayGallery(currentImages);
            displayStats(currentImages);
        })
        .catch(error => {
            console.error('Ошибка загрузки данных:', error);
            galleryEl.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    Ошибка загрузки данных: ${error.message}<br>
                    Пожалуйста, попробуйте позже.
                </div>
            `;
        });
}

function init() {
    loadImages();
    
    applyFilterBtn.addEventListener('click', filterImages);
    
    sortRatingBtn.addEventListener('click', () => {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        sortRatingBtn.innerHTML = sortDirection === 'asc' 
            ? '<i class="fas fa-sort-amount-down-alt"></i> По возрастанию' 
            : '<i class="fas fa-sort-amount-down"></i> По убыванию';
        filterImages();
    });
    
    searchFilterEl.addEventListener('input', filterImages);
    
    categoryFilterEl.addEventListener('change', filterImages);
    
    closeModalEl.addEventListener('click', () => {
        modalEl.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modalEl) {
            modalEl.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalEl.style.display === 'flex') {
            modalEl.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
