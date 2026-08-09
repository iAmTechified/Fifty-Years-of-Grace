const fs = require('fs');

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

async function getUrls() {
  const urls = {};
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    try {
      const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${stop.query}&prop=pageimages&format=json&pithumbsize=1000`;
      const res = await fetch(apiUrl).then(r => r.json());
      const pages = res.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pageId !== '-1' && pages[pageId].thumbnail) {
        urls[stop.name] = pages[pageId].thumbnail.source;
      }
    } catch (e) {}
  }
  fs.writeFileSync('urls.json', JSON.stringify(urls, null, 2));
}

getUrls();
