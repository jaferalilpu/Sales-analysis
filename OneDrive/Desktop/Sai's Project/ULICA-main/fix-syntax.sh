#!/bin/bash

cd /Users/saicharan/Downloads/Ulica/frontend

# Fix common syntax issues
find app -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/&apos;/'\''/g'
find app -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/&quot;/"/g'
find app -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/&lt;/</g'
find app -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/&gt;/>/g'
find app -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/&amp;/\&/g'

echo "Syntax fixes applied!"
