const UA = { 'User-Agent': 'Mozilla/5.0' };
for (const url of [
  'https://vumbnail.com/567281997.jpg',
  'https://i.vimeocdn.com/video/567281997.jpg',
]) {
  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) });
    console.log(r.status, r.headers.get('content-length'), url);
  } catch (e) {
    console.log('ERR', url, e.message);
  }
}
