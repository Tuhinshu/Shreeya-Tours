# Custom Client Tour Photos Directory

You can drop high-resolution photos directly into this folder:
`frontend/public/tours/`

### Example Usage:
1. Place your file: `frontend/public/tours/my-tour-photo.jpg`
2. In `mockData.ts` (or any tour prop/CMS):
   ```js
   featuredImage: '/tours/my-tour-photo.jpg',
   gallery: [
     '/tours/my-tour-photo.jpg',
     '/tours/hotel-view.jpg',
     '/tours/monument.jpg'
   ]
   ```
The detailed tour view and catalog cards will dynamically load and render these local images with automated fallback support.
