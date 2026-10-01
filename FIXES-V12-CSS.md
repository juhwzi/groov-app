# Fixes v12 CSS

Fixed a malformed CSS append in `src/app/globals.css` where newline characters were inserted as literal `\\n` text inside the stylesheet. This caused Next.js/Turbopack to report `Unknown word` around the Groov Brand Landing V2 section.

The section now contains real CSS line breaks and remains otherwise unchanged.
