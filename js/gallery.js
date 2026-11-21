const byId = id => document.getElementById(id);
const galleryViewer = byId('gallery-viewer');
const galleryTiles = [...document.querySelectorAll('.gallery-open')];
let galleryIndex = 0;
function showGalleryImage(index){
  galleryIndex = (index + galleryTiles.length) % galleryTiles.length;
  const tile = galleryTiles[galleryIndex];
  const photo = tile.querySelector('img');
  const viewerPhoto = byId('gallery-full');
  viewerPhoto.src = photo.src;
  viewerPhoto.alt = photo.alt;
  byId('gallery-caption').textContent = tile.closest('figure').querySelector('figcaption').innerText;
}
galleryTiles.forEach((tile,index)=>tile.addEventListener('click',()=>{
  showGalleryImage(index);
  galleryViewer.showModal();
}));
byId('gallery-close').addEventListener('click',()=>galleryViewer.close());
byId('gallery-prev').addEventListener('click',()=>showGalleryImage(galleryIndex-1));
byId('gallery-next').addEventListener('click',()=>showGalleryImage(galleryIndex+1));
galleryViewer.addEventListener('keydown',event=>{
  if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){
    event.preventDefault();
    showGalleryImage(galleryIndex+(event.key === 'ArrowLeft' ? -1 : 1));
  }
});
