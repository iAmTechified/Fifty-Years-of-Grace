const fs = require('fs');
const https = require('https');
const path = require('path');

const stops = [
  { name: "St Stephen's Green", query: "St_Stephen's_Green" },
  { name: 'Grafton Street', query: 'Grafton_Street' },
  { name: 'Exchequer Street', query: 'Exchequer_Street,_Dublin' },
  { name: 'Powerscourt Townhouse', query: 'Powerscourt_House,_Dublin' },
  { name: 'Trinity College', query: 'Trinity_College_Dublin' },
  { name: 'Bank of Ireland', query: 'Bank_of_Ireland_College_Green' },
  { name: 'The Spire', query: 'Spire_of_Dublin' },
  { name: 'Henry Street', query: 'Henry_Street,_Dublin' },
  { name: "Ha'penny Bridge", query: "Ha'penny_Bridge" },
  { name: 'Temple Bar', query: 'Temple_Bar,_Dublin' }
];

const dir = path.join('c:/Users/User/Desktop/obele/public/dublin-tour');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function downloadImages() {
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    try {
      const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${stop.query}&prop=pageimages&format=json&pithumbsize=1000`;
      const res = await fetch(apiUrl).then(r => r.json());
      const pages = res.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pageId === '-1' || !pages[pageId].thumbnail) {
        console.log('No image found for', stop.name);
        continue;
      }
      const imgUrl = pages[pageId].thumbnail.source;
      const dest = path.join(dir, `stop-${i + 1}.jpg`);
      
      const file = fs.createWriteStream(dest);
      await new Promise((resolve, reject) => {
        https.get(imgUrl, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
            console.log('Downloaded', stop.name);
          });
        }).on('error', reject);
      });
    } catch (e) {
      console.error('Error for', stop.name, e.message);
    }
  }
}

downloadImages();
