const JSONBIN_KEY = ‘$2a$10$ffNLH8Yhlt9tyvNGuE8M4un89TWMYkhSj3PVAOqcshrV1.6RoQcoC’;
const BIN_ID = ‘699dae4343b1c97be999b0b0’;
const JSONBIN_API = ‘https://api.jsonbin.io/v3’;

let selectedLike = null;
let selectedStar = 0;
let selectedFeelings = [];

function setLike(val) {
selectedLike = val;
document.getElementById(‘likeYes’).className = ‘like-btn’ + (val === ‘yes’ ? ’ selected-yes’ : ‘’);
document.getElementById(‘likeNo’).className = ‘like-btn’ + (val === ‘no’ ? ’ selected-no’ : ‘’);
}

function setStar(n) {
selectedStar = n;
document.querySelectorAll(’.star’).forEach((s, i) => s.classList.toggle(‘active’, i < n));
}

function toggleFeeling(btn) {
btn.classList.toggle(‘selected’);
const feeling = btn.textContent.trim();
if (btn.classList.contains(‘selected’)) selectedFeelings.push(feeling);
else selectedFeelings = selectedFeelings.filter(f => f !== feeling);
}

async function submitFeedback() {
const name = document.getElementById(‘readerName’).value.trim();
if (!name) { alert(‘Please enter your name!’); return; }
if (!selectedLike) { alert(‘Please tell us if you liked the story!’); return; }
if (!selectedStar) { alert(‘Please give a star rating!’); return; }

const btn = document.querySelector(’.submit-btn’);
btn.textContent = ‘Saving…’;
btn.disabled = true;

const entry = {
id: Date.now(),
story: STORY_ID,
name,
liked: selectedLike,
stars: selectedStar,
feelings: selectedFeelings,
comment: document.getElementById(‘comment’).value.trim(),
date: new Date().toLocaleDateString()
};

try {
const readRes = await fetch(`${JSONBIN_API}/b/${BIN_ID}/latest`, {
headers: { ‘X-Master-Key’: JSONBIN_KEY }
});
const readData = await readRes.json();
const record = readData.record || { stories: {} };
if (!record.stories) record.stories = {};
if (!record.stories[STORY_ID]) record.stories[STORY_ID] = [];
record.stories[STORY_ID].push(entry);

```
await fetch(`${JSONBIN_API}/b/${BIN_ID}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_KEY },
  body: JSON.stringify(record)
});

document.getElementById('feedbackForm').style.display = 'none';
document.getElementById('thankYou').style.display = 'block';
window.scrollTo(0, document.getElementById('thankYou').offsetTop - 20);
```

} catch(e) {
btn.textContent = ‘Submit My Feedback ✓’;
btn.disabled = false;
alert(‘Sorry, could not save. Please try again.’);
console.error(e);
}
}
