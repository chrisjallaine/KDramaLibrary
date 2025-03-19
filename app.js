document.addEventListener('DOMContentLoaded', function() {
  // Initialize Feather icons
  feather.replace();

  // DOM Elements
  const addKdramaBtn = document.getElementById('add-kdrama-btn');
  const addFirstKdramaBtn = document.getElementById('add-first-kdrama-btn');
  const kdramaGrid = document.getElementById('kdrama-grid');
  const emptyState = document.getElementById('empty-state');
  const kdramaModal = document.getElementById('kdrama-modal');
  const modalTitle = document.getElementById('modal-title');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const kdramaForm = document.getElementById('kdrama-form');
  const submitBtn = document.getElementById('submit-btn');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  
  // Form elements
  const kdramaIdInput = document.getElementById('kdrama-id');
  const titleInput = document.getElementById('title');
  const yearInput = document.getElementById('year');
  const episodesInput = document.getElementById('episodes');
  const networkInput = document.getElementById('network');
  const statusSelect = document.getElementById('status');
  const synopsisInput = document.getElementById('synopsis');
  const newGenreInput = document.getElementById('new-genre');
  const addGenreBtn = document.getElementById('add-genre-btn');
  const genresContainer = document.getElementById('genres-container');
  const newCastNameInput = document.getElementById('new-cast-name');
  const newCastRoleInput = document.getElementById('new-cast-role');
  const addCastBtn = document.getElementById('add-cast-btn');
  const castContainer = document.getElementById('cast-container');
  const starRatingContainer = document.getElementById('star-rating');
  const ratingValueDisplay = document.getElementById('rating-value');
  
  // Image upload elements
  const posterUploadInput = document.getElementById('poster-upload');
  const uploadTriggerBtn = document.getElementById('upload-trigger-btn');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const imagePreview = document.getElementById('image-preview');
  const imageUploadPlaceholder = document.getElementById('image-upload-placeholder');
  const removeImageBtn = document.getElementById('remove-image-btn');

  // State
  let kdramas = [];
  let currentRating = 0;
  let currentGenres = [];
  let currentCast = [];
  let currentPoster = '';
  let isEditing = false;
  let editingId = null;

  // Initialize the app
  init();

  // Event Listeners
  addKdramaBtn.addEventListener('click', openAddModal);
  addFirstKdramaBtn.addEventListener('click', openAddModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  kdramaForm.addEventListener('submit', handleFormSubmit);
  
  searchInput.addEventListener('input', handleSearch);
  clearSearchBtn.addEventListener('click', clearSearch);
  
  newGenreInput.addEventListener('input', validateGenreInput);
  addGenreBtn.addEventListener('click', addGenre);
  newGenreInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && newGenreInput.value.trim()) {
      e.preventDefault();
      addGenre();
    }
  });
  
  newCastNameInput.addEventListener('input', validateCastInputs);
  newCastRoleInput.addEventListener('input', validateCastInputs);
  addCastBtn.addEventListener('click', addCastMember);
  
  uploadTriggerBtn.addEventListener('click', triggerFileInput);
  posterUploadInput.addEventListener('change', handleImageUpload);
  removeImageBtn.addEventListener('click', removeImage);

  // Initialize star rating
  initStarRating();

  // Functions
  function init() {
    loadKdramas();
    renderKdramas();
    updateEmptyState();
    
    // Set default year to current year
    yearInput.value = new Date().getFullYear();
    episodesInput.value = 16;
  }

  function loadKdramas() {
    const storedKdramas = localStorage.getItem('kdramas');
    kdramas = storedKdramas ? JSON.parse(storedKdramas) : [];
  }

  function saveKdramas() {
    localStorage.setItem('kdramas', JSON.stringify(kdramas));
  }

  function renderKdramas(filteredKdramas = null) {
    const dramasToRender = filteredKdramas || kdramas;
    kdramaGrid.innerHTML = '';
    
    dramasToRender.forEach(kdrama => {
      const card = createKdramaCard(kdrama);
      kdramaGrid.appendChild(card);
    });
    
    // Re-initialize Feather icons for the newly created cards
    feather.replace();
  }

  function createKdramaCard(kdrama) {
    const template = document.getElementById('kdrama-card-template');
    const card = template.content.cloneNode(true).children[0];
    
    // Set poster image
    const posterImg = card.querySelector('.poster-img');
    if (kdrama.poster) {
      posterImg.src = kdrama.poster;
      posterImg.alt = kdrama.title;
    } else {
      posterImg.src = 'https://via.placeholder.com/300x450?text=No+Image';
      posterImg.alt = 'No Image';
    }
    
    // Set title and synopsis
    card.querySelector('.kdrama-title').textContent = kdrama.title;
    card.querySelector('.kdrama-synopsis').textContent = kdrama.synopsis;
    
    // Set year and info
    card.querySelector('.kdrama-year').textContent = kdrama.year;
    card.querySelector('.kdrama-info').textContent = `${kdrama.episodes} episodes • ${kdrama.network}`;
    
    // Set genres
    const genresContainer = card.querySelector('.kdrama-genres');
    kdrama.genres.slice(0, 2).forEach(genre => {
      const genreTag = document.createElement('span');
      genreTag.className = 'genre-tag';
      genreTag.textContent = genre;
      genresContainer.appendChild(genreTag);
    });
    
    if (kdrama.genres.length > 2) {
      const moreTag = document.createElement('span');
      moreTag.className = 'genre-tag outline';
      moreTag.textContent = `+${kdrama.genres.length - 2}`;
      genresContainer.appendChild(moreTag);
    }
    
    // Set star rating
    const ratingContainer = card.querySelector('.star-rating-display');
    renderStarRatingDisplay(ratingContainer, kdrama.rating);
    
    // Set edit and delete buttons
    const editBtn = card.querySelector('.btn-edit');
    const deleteBtn = card.querySelector('.btn-delete');
    
    editBtn.addEventListener('click', () => openEditModal(kdrama));
    deleteBtn.addEventListener('click', () => confirmDeleteKdrama(kdrama.id));
    
    return card;
  }

  function renderStarRatingDisplay(container, rating) {
    container.innerHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      const star = document.createElement('span');
      star.innerHTML = feather.icons.star.toSvg();
      star.className = 'star';
      
      if (i < fullStars) {
        star.classList.add('filled');
      } else if (i === fullStars && hasHalfStar) {
        star.classList.add('half');
      }
      
      container.appendChild(star);
    }
  }

  function initStarRating() {
    starRatingContainer.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
      const star = document.createElement('span');
      star.innerHTML = feather.icons.star.toSvg();
      star.className = 'star';
      star.dataset.value = i + 1;
      
      star.addEventListener('click', () => {
        setRating(i + 1);
      });
      
      star.addEventListener('mouseover', () => {
        highlightStars(i + 1);
      });
      
      star.addEventListener('mouseout', () => {
        highlightStars(currentRating);
      });
      
      starRatingContainer.appendChild(star);
    }
  }

  function highlightStars(count) {
    const stars = starRatingContainer.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
      if (index < count) {
        star.classList.add('filled');
      } else {
        star.classList.remove('filled');
      }
    });
  }

  function setRating(rating) {
    currentRating = rating;
    highlightStars(rating);
    ratingValueDisplay.textContent = `${rating.toFixed(1)} / 5`;
  }

  function openAddModal() {
    resetForm();
    isEditing = false;
    editingId = null;
    modalTitle.textContent = 'Add New K-Drama';
    submitBtn.textContent = 'Add K-Drama';
    kdramaModal.classList.remove('hidden');
  }

  function openEditModal(kdrama) {
    resetForm();
    isEditing = true;
    editingId = kdrama.id;
    
    // Fill form with kdrama data
    kdramaIdInput.value = kdrama.id;
    titleInput.value = kdrama.title;
    yearInput.value = kdrama.year;
    episodesInput.value = kdrama.episodes;
    networkInput.value = kdrama.network;
    statusSelect.value = kdrama.status;
    synopsisInput.value = kdrama.synopsis;
    
    // Set rating
    setRating(kdrama.rating);
    
    // Set genres
    currentGenres = [...kdrama.genres];
    renderGenres();
    
    // Set cast
    currentCast = [...kdrama.cast];
    renderCast();
    
    // Set poster
    if (kdrama.poster) {
      currentPoster = kdrama.poster;
      imagePreview.src = kdrama.poster;
      imagePreviewContainer.classList.remove('hidden');
      imageUploadPlaceholder.classList.add('hidden');
    }
    
    modalTitle.textContent = 'Edit K-Drama';
    submitBtn.textContent = 'Update K-Drama';
    kdramaModal.classList.remove('hidden');
  }

  function closeModal() {
    kdramaModal.classList.add('hidden');
    resetForm();
  }

  function resetForm() {
    kdramaForm.reset();
    currentRating = 0;
    currentGenres = [];
    currentCast = [];
    currentPoster = '';
    
    // Reset rating
    highlightStars(0);
    ratingValueDisplay.textContent = '0.0 / 5';
    
    // Reset genres
    genresContainer.innerHTML = '';
    
    // Reset cast
    castContainer.innerHTML = '';
    
    // Reset image
    imagePreview.src = '';
    imagePreviewContainer.classList.add('hidden');
    imageUploadPlaceholder.classList.remove('hidden');
    
    // Reset year to current year
    yearInput.value = new Date().getFullYear();
    episodesInput.value = 16;
    
    // Reset validation states
    validateGenreInput();
    validateCastInputs();
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    
    const kdrama = {
      id: isEditing ? editingId : crypto.randomUUID(),
      title: titleInput.value.trim(),
      poster: currentPoster,
      year: parseInt(yearInput.value),
      episodes: parseInt(episodesInput.value),
      rating: currentRating,
      genres: currentGenres,
      network: networkInput.value.trim(),
      status: statusSelect.value,
      synopsis: synopsisInput.value.trim(),
      cast: currentCast
    };
    
    if (isEditing) {
      // Update existing kdrama
      const index = kdramas.findIndex(k => k.id === editingId);
      if (index !== -1) {
        kdramas[index] = kdrama;
      }
    } else {
      // Add new kdrama
      kdramas.push(kdrama);
    }
    
    saveKdramas();
    renderKdramas();
    updateEmptyState();
    closeModal();
  }

  function confirmDeleteKdrama(id) {
    if (confirm('Are you sure you want to delete this K-Drama?')) {
      deleteKdrama(id);
    }
  }

  function deleteKdrama(id) {
    kdramas = kdramas.filter(kdrama => kdrama.id !== id);
    saveKdramas();
    renderKdramas();
    updateEmptyState();
  }

  function updateEmptyState() {
    if (kdramas.length === 0) {
      kdramaGrid.classList.add('hidden');
      emptyState.classList.remove('hidden');
    } else {
      kdramaGrid.classList.remove('hidden');
      emptyState.classList.add('hidden');
    }
  }

  function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query) {
      clearSearchBtn.classList.remove('hidden');
      const filteredKdramas = kdramas.filter(kdrama => 
        kdrama.title.toLowerCase().includes(query)
      );
      renderKdramas(filteredKdramas);
    } else {
      clearSearchBtn.classList.add('hidden');
      renderKdramas();
    }
  }

  function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    renderKdramas();
  }

  function validateGenreInput() {
    const value = newGenreInput.value.trim();
    addGenreBtn.disabled = !value || currentGenres.includes(value);
  }

  function addGenre() {
    const genre = newGenreInput.value.trim();
    
    if (genre && !currentGenres.includes(genre)) {
      currentGenres.push(genre);
      renderGenres();
      newGenreInput.value = '';
      addGenreBtn.disabled = true;
    }
  }

  function renderGenres() {
    genresContainer.innerHTML = '';
    
    currentGenres.forEach(genre => {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerHTML = `
        ${genre}
        <span class="tag-remove" data-genre="${genre}">
          ${feather.icons.x.toSvg()}
        </span>
      `;
      
      const removeBtn = tag.querySelector('.tag-remove');
      removeBtn.addEventListener('click', () => removeGenre(genre));
      
      genresContainer.appendChild(tag);
    });
  }

  function removeGenre(genre) {
    currentGenres = currentGenres.filter(g => g !== genre);
    renderGenres();
    validateGenreInput();
  }

  function validateCastInputs() {
    const nameValue = newCastNameInput.value.trim();
    const roleValue = newCastRoleInput.value.trim();
    addCastBtn.disabled = !nameValue || !roleValue;
  }

  function addCastMember() {
    const name = newCastNameInput.value.trim();
    const role = newCastRoleInput.value.trim();
    
    if (name && role) {
      currentCast.push({ name, role });
      renderCast();
      newCastNameInput.value = '';
      newCastRoleInput.value = '';
      addCastBtn.disabled = true;
    }
  }

  function renderCast() {
    castContainer.innerHTML = '';
    
    currentCast.forEach((member, index) => {
      const item = document.createElement('div');
      item.className = 'cast-item';
      item.innerHTML = `
        <div class="cast-info">
          <span class="cast-name">${member.name}</span>
          <span class="cast-role">${member.role}</span>
        </div>
        <span class="cast-remove" data-index="${index}">
          ${feather.icons.minus.toSvg()}
        </span>
      `;
      
      const removeBtn = item.querySelector('.cast-remove');
      removeBtn.addEventListener('click', () => removeCastMember(index));
      
      castContainer.appendChild(item);
    });
  }

  function removeCastMember(index) {
    currentCast.splice(index, 1);
    renderCast();
  }

  function triggerFileInput() {
    posterUploadInput.click();
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const imageDataUrl = event.target.result;
      imagePreview.src = imageDataUrl;
      currentPoster = imageDataUrl;
      imagePreviewContainer.classList.remove('hidden');
      imageUploadPlaceholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    imagePreview.src = '';
    currentPoster = '';
    imagePreviewContainer.classList.add('hidden');
    imageUploadPlaceholder.classList.remove('hidden');
    posterUploadInput.value = '';
  }
});


function showConfetti() {
  const confettiCount = 200;
  const colors = ['#ff3e78', '#7000ff', '#00e1ff', '#00ffa3', '#ffde00'];
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    confetti.style.opacity = Math.random();
    confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }
}


let isEditing = false; 
if (!isEditing) {
  showConfetti();
}

function updateEmptyStateWithEmoji() {
  const emojis = ['🍿', '📺', '🎬', '💖', '✨', '🌟'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  
  const emptyStateTitle = document.querySelector('.empty-state-title');
  if (emptyStateTitle) {
    emptyStateTitle.textContent = `Your K-Drama collection is empty ${randomEmoji}`;
  }
}


updateEmptyStateWithEmoji();

.confetti {
  position: fixed;
  width: 10px;
  height: 10px;
  pointer-events: none;
  z-index: 9999;
  animation: confettiFall linear forwards;
}

@keyframes confettiFall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
  }
}
