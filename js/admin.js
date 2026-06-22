document.addEventListener('DOMContentLoaded', async () => {
  
  // 1. TABS LOGIC
  const tabBtns = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.admin-section');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });

  // 2. LOAD EXISTING DATA
  let cmsData = {
    home: { welcomeImages: ["", "", ""] },
    about: { directorImage: "", photoStrip: ["", "", "", ""] },
    global: { address: "", phones: ["", "", ""], email: "", facebook: "", instagram: "", tiktok: "" },
    gallery: []
  };

  try {
    const res = await fetch(`content.json?t=${new Date().getTime()}`);
    if (res.ok) {
      const fetchedData = await res.json();
      cmsData = { ...cmsData, ...fetchedData }; 
    }
  } catch (e) {
    console.log("No existing content.json found. Starting fresh.");
  }

  // 3. POPULATE INPUT FIELDS
  // Home
  document.getElementById('home-img-1').value = cmsData.home.welcomeImages[0] || "";
  document.getElementById('home-img-2').value = cmsData.home.welcomeImages[1] || "";
  document.getElementById('home-img-3').value = cmsData.home.welcomeImages[2] || "";

  // About
  document.getElementById('about-director').value = cmsData.about.directorImage || "";
  if (cmsData.about.photoStrip && cmsData.about.photoStrip.length >= 4) {
    document.getElementById('strip-1').value = cmsData.about.photoStrip[0] || "";
    document.getElementById('strip-2').value = cmsData.about.photoStrip[1] || "";
    document.getElementById('strip-3').value = cmsData.about.photoStrip[2] || "";
    document.getElementById('strip-4').value = cmsData.about.photoStrip[3] || "";
  }

  // Contact
  document.getElementById('contact-address').value = cmsData.global.address || "";
  if (cmsData.global.phones && cmsData.global.phones.length >= 3) {
    document.getElementById('phone-1').value = cmsData.global.phones[0] || "";
    document.getElementById('phone-2').value = cmsData.global.phones[1] || "";
    document.getElementById('phone-3').value = cmsData.global.phones[2] || "";
  }
  document.getElementById('contact-email').value = cmsData.global.email || "";
  document.getElementById('contact-fb').value = cmsData.global.facebook || "";
  document.getElementById('contact-ig').value = cmsData.global.instagram || "";
  document.getElementById('contact-tt').value = cmsData.global.tiktok || "";

// 4. GALLERY MANAGER (105 Slots with Live Preview)
  const galleryList = document.getElementById('gallery-list');
  galleryList.innerHTML = ''; 

  const MAX_SLOTS = 105; 

  for (let i = 0; i < MAX_SLOTS; i++) {
    const item = (cmsData.gallery && cmsData.gallery[i]) ? cmsData.gallery[i] : { image: "", category: "environment", caption: "" };
    
    const row = document.createElement('div');
    row.className = 'gallery-row';
    
    row.innerHTML = `
      <div class="slot-badge">Slot ${i + 1}</div>
      <img src="${item.image}" class="preview-thumb" onerror="this.style.opacity='0'" onload="this.style.opacity='1'" alt="">
      <div class="form-group">
        <label>Image Path</label>
        <input type="text" class="gal-img" placeholder="img/pic.jpg" value="${item.image}">
      </div>
      <div class="form-group">
        <label>Category</label>
        <select class="gal-cat">
          <option value="environment" ${item.category === 'environment' ? 'selected' : ''}>School Environment</option>
          <option value="advert" ${item.category === 'advert' ? 'selected' : ''}>Advert Shows</option>
          <option value="colour" ${item.category === 'colour' ? 'selected' : ''}>Colour Day</option>
          <option value="grandparents" ${item.category === 'grandparents' ? 'selected' : ''}>Grandparents Day</option>
          <option value="classroom" ${item.category === 'classroom' ? 'selected' : ''}>Classroom</option>
          <option value="sports" ${item.category === 'sports' ? 'selected' : ''}>Inter-House Sports</option>
          <option value="homeec" ${item.category === 'homeec' ? 'selected' : ''}>Home Economics</option>
          <option value="xmas" ${item.category === 'xmas' ? 'selected' : ''}>X-Mas Show</option>
        </select>
      </div>
      <div class="form-group">
        <label>Caption</label>
        <input type="text" class="gal-cap" placeholder="Optional" value="${item.caption || ''}">
      </div>
    `;

    // The Magic Live Preview Script
    const inputPath = row.querySelector('.gal-img');
    const thumbImg = row.querySelector('.preview-thumb');

    inputPath.addEventListener('input', (e) => {
      thumbImg.src = e.target.value.trim(); // Instantly updates the picture as they type!
    });

    galleryList.appendChild(row);
  }

  // 5. SAVE & DOWNLOAD GENERATOR
  document.getElementById('save-btn').addEventListener('click', () => {
    
    // Gather Home
    cmsData.home.welcomeImages = [
      document.getElementById('home-img-1').value.trim(),
      document.getElementById('home-img-2').value.trim(),
      document.getElementById('home-img-3').value.trim()
    ];

    // Gather About
    cmsData.about.directorImage = document.getElementById('about-director').value.trim();
    cmsData.about.photoStrip = [
      document.getElementById('strip-1').value.trim(),
      document.getElementById('strip-2').value.trim(),
      document.getElementById('strip-3').value.trim(),
      document.getElementById('strip-4').value.trim()
    ];

    // Gather Contact
    cmsData.global.address = document.getElementById('contact-address').value.trim();
    cmsData.global.phones = [
      document.getElementById('phone-1').value.trim(),
      document.getElementById('phone-2').value.trim(),
      document.getElementById('phone-3').value.trim()
    ];
    cmsData.global.email = document.getElementById('contact-email').value.trim();
    cmsData.global.facebook = document.getElementById('contact-fb').value.trim();
    cmsData.global.instagram = document.getElementById('contact-ig').value.trim();
    cmsData.global.tiktok = document.getElementById('contact-tt').value.trim();

    // Gather Gallery (Only save slots that have an image URL so blank slots don't break the frontend layout)
    cmsData.gallery = [];
    document.querySelectorAll('.gallery-row').forEach(row => {
      const img = row.querySelector('.gal-img').value.trim();
      if (img !== "") {
        cmsData.gallery.push({
          image: img,
          category: row.querySelector('.gal-cat').value,
          caption: row.querySelector('.gal-cap').value.trim()
        });
      }
    });

    // Generate JSON & trigger download
    const jsonString = JSON.stringify(cmsData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = "content.json"; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("Updates saved! Replace the old content.json in your website folder with this new downloaded file.");
  });
});
