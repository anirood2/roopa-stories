/**
 * feedback-fix.js
 * Drop this file in your roopa-stories repo root.
 * Each story page calls: submitFeedback() — this replaces the broken window.storage version.
 */

const JSONBIN_KEY = '$2a$10$ffNLH8Yhlt9tyvNGuE8M4un89TWMYkhSj3PVAOqcshrV1.6RoQcoC';
const JSONBIN_API = 'https://api.jsonbin.io/v3';

async function getBinId() {
  let binId = localStorage.getItem('roopa-feedback-bin');
  if (binId) return binId;
  // First ever submission — auto-create the bin
  const res = await fetch(`${JSONBIN_API}/b`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY,
      'X-Bin-Name': 'roopa-stories-feedback',
      'X-Bin-Private': 'true'
    },
    body: JSON.stringify({ stories: {} })
  });
  const data = await res.json();
  const binId2 = data.metadata.id;
  localStorage.setItem('roopa-feedback-bin', binId2);
  return binId2;
}

window.submitFeedback = async function() {
  const name = document.getElementById('readerName').value.trim();
  if (!name) { alert('Please enter your name!'); return; }
  if (!window._selectedLike) { alert('Please tell us if you liked the story!'); return; }
  if (!window._selectedStar) { alert('Please give a star rating!'); return; }

  const btn = document.querySelector('.submit-btn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  const entry = {
    id: Date.now(),
    story: window.STORY_ID || 'unknown',
    name,
    liked: window._selectedLike,
    stars: window._selectedStar,
    feelings: window._selectedFeelings || [],
    comment: document.getElementById('comment').value.trim(),
    date: new Date().toLocaleDateString()
  };

  try {
    const binId = await getBinId();
    const readRes = await fetch(`${JSONBIN_API}/b/${binId}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_KEY }
    });
    const readData = await readRes.json();
    const record = readData.record || { stories: {} };
    if (!record.stories) record.stories = {};
    if (!record.stories[entry.story]) record.stories[entry.story] = [];
    record.stories[entry.story].push(entry);

    await fetch(`${JSONBIN_API}/b/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_KEY
      },
      body: JSON.stringify(record)
    });

    document.getElementById('feedbackForm').style.display = 'none';
    document.getElementById('thankYou').style.display = 'block';
    window.scrollTo(0, document.getElementById('thankYou').offsetTop - 20);
  } catch(e) {
    btn.textContent = 'Submit My Feedback ✓';
    btn.disabled = false;
    alert('Sorry, could not save feedback. Please try again.');
    console.error(e);
  }
};

// Override the old local variable names the story pages use
Object.defineProperty(window, 'selectedLike', {
  get() { return window._selectedLike; },
  set(v) { window._selectedLike = v; }
});
Object.defineProperty(window, 'selectedStar', {
  get() { return window._selectedStar; },
  set(v) { window._selectedStar = v; }
});
Object.defineProperty(window, 'selectedFeelings', {
  get() { return window._selectedFeelings || (window._selectedFeelings = []); },
  set(v) { window._selectedFeelings = v; }
});
window._selectedFeelings = [];
