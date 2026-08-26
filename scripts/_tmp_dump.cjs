const slugs=['all-divisions-with-the-highest-score-of-a-binary-array','find-substring-with-given-hash-value','groups-of-strings','amount-of-new-area-painted-each-day','minimum-cost-to-set-cooking-time','minimum-sum-of-four-digit-number-after-splitting-digits','sort-even-and-odd-indices-independently'];
for(const s of slugs){
  const j=JSON.parse(require('fs').readFileSync('public/descriptions/'+s+'.json','utf8'));
  console.log('==== '+s+' ==== q='+j.q+' d='+j.d);
  let c=j.c.replace(/<[^>]+>/g,' ').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
  console.log(c.substring(Math.max(0,c.length-1200)));
}
