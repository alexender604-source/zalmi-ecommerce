# Product image replacement audit

## Catalog structure

The active catalog is stored in PostgreSQL through Prisma. `data/zarshal-products.json` supplies the seed product data, `data/product-image-galleries.json` supplies the approved replacement galleries, and `prisma/seed.ts` synchronizes those galleries into `ProductImage` records. Storefront cards and product pages read the same ordered database image relationship, so cart thumbnails, product sections, listings, and galleries share the primary image.

The database contains 16 products and 19 categories. The product-bearing categories are Peshawari Chappal, Smart Zalmi Chappal, Takidar Chappal, Khaddar, and Men Shawls. Other configured categories currently have no product records.

## Confident replacements

| Category | Product | Supplied files | Local gallery |
| --- | --- | --- | --- |
| Takidar | Black Woven Takidar Peshawari Chappal – Medium Sole | 128–131 | 4 images |
| Takidar | Master Brown Woven Takidar Peshawari Chappal – Medium Sole | 132–137 | 6 images |
| Smart Zalmi | Premium Dark Brown Smart Zalmi Round Edge Peshawari Chappal | 18–22 | 5 images |
| Smart Zalmi | Premium Black Smart Zalmi Round Edge Peshawari Chappal | 23–25 | 3 images |
| Takidar | Black Doted Takidar Medium Sole Peshawari Chappal | 111–114 | 4 images |
| Takidar | Radish Brown Doted Takidar Medium Sole Peshawari Chappal | 106–110 | 5 images |
| Takidar | Dark Brown Doted Takidar Medium Sole Peshawari Chappal | 115–119 | 5 images |
| Takidar | Double Shade Medium Sole Takidar Peshawari Chappal | 120–124 | 5 images |

The 37 selected images are exact visual matches to the former primary photos. They were converted from 1080×1080 JPEG to 1080×1080 WebP at quality 88. Their combined size is about 2.1 MB.

## Products without a confident supplied match

| Category | Product | Current image | Reason |
| --- | --- | --- | --- |
| Khaddar | Dark Blue Handmade Charsadda Khaddar | `/images/catalog/dark-blue-handmade-charsadda-khaddar.jpg` | No supplied Khaddar fabric image |
| Khaddar | Chocolate Handmade Charsadda Khaddar | `/images/catalog/chocolate-handmade-charsadda-khaddar.jpg` | No supplied Khaddar fabric image |
| Khaddar | Camel Handmade Charsadda Khaddar | `/images/catalog/camel-handmade-charsadda-khaddar.jpg` | No supplied Khaddar fabric image |
| Khaddar | Brown Handmade Charsadda Khaddar | `/images/catalog/brown-handmade-charsadda-khaddar.jpg` | No supplied Khaddar fabric image |
| Men Shawls | Imran Khan 804 Woolen Shawl | `/images/catalog/imran-khan-804-woolen-shawl.jpg` | Supplied shawl is gray and has no product identifier |
| Men Shawls | Black Plain 100% Acrylic Men Shawl | `/images/catalog/black-plain-100-acrylic-men-shawl.jpg` | Supplied shawl is gray, not black |
| Men Shawls | Off-White 48 Pure Australian Woolen Shawl with Frame Border | `/images/catalog/off-white-48-pure-australian-woolen-shawl-with-frame-border.jpg` | Supplied shawl is gray, not off-white |
| Men Shawls | Ivory Cream 48 Pure Australian Woolen Shawl with Frame Border | `/images/catalog/ivory-cream-48-pure-australian-woolen-shawl-with-frame-border.jpg` | Supplied shawl is gray, not ivory cream |

## Unmatched supplied images

The ZIP contains 168 root-level files named only by number. After the 37 exact matches above, 131 files remain unused. They are retained in the source ZIP and were not copied into the public website.

| Supplied files | Possible content | Why unused |
| --- | --- | --- |
| 1–17 | Several smooth leather Peshawari variants | No exact product name or variant record |
| 26–105 | Smooth, woven, and suede footwear plus Pakol caps | No exact product name or corresponding catalog record |
| 125–127 | Beige slipper/loafer | No corresponding catalog product |
| 138–165 | Perforated footwear, sandals, lifestyle views, and Pakol | No exact product name or corresponding catalog record |
| 166–168 | Gray men's shawl | Does not match the color or identity of an existing shawl product |

No category image was replaced from these unmatched files because the numbered ZIP contains no folder or product metadata that establishes a reliable category relationship.

## Removed assets

The eight superseded gray/gold-background product photos were removed after their runtime, seed, asset-manifest, and documentation references were replaced. Other product photographs remain because no confident supplied match exists.
