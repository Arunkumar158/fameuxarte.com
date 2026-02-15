"""
Generate optimized favicon files for Fameuxarte website
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_favicon_from_text():
    """Create a favicon with 'FA' text on a premium background"""
    
    # Sizes needed for comprehensive favicon support
    sizes = [16, 32, 48, 64, 128, 180, 192, 256, 512]
    
    # Colors
    bg_color = "#1a1a2e"  # Dark navy/black
    text_color = "#D4AF37"  # Gold
    
    # Create each size
    favicons = {}
    
    for size in sizes:
        # Create image with dark background
        img = Image.new('RGB', (size, size), bg_color)
        draw = ImageDraw.Draw(img)
        
        # Try to use a nice font, fall back to default if not available
        try:
            # Try to load a bold font
            font_size = int(size * 0.5)  # 50% of image size
            try:
                # Try system fonts
                font = ImageFont.truetype("arialbd.ttf", font_size)
            except:
                try:
                    font = ImageFont.truetype("arial.ttf", font_size)
                except:
                    # Use default font
                    font = ImageFont.load_default()
        except:
            font = ImageFont.load_default()
        
        # Draw text centered
        text = "FA"
        
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Calculate position to center text
        x = (size - text_width) // 2 - bbox[0]
        y = (size - text_height) // 2 - bbox[1]
        
        # Draw the text in gold
        draw.text((x, y), text, fill=text_color, font=font)
        
        favicons[size] = img
    
    return favicons

def save_favicons(favicons, output_dir):
    """Save favicon files in various formats"""
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Save as PNG files
    for size, img in favicons.items():
        img.save(os.path.join(output_dir, f'favicon-{size}x{size}.png'))
    
    # Save as ICO file (multi-resolution)
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_images = [favicons[size].resize((size, size), Image.Resampling.LANCZOS) 
                  for size, _ in ico_sizes]
    ico_images[0].save(
        os.path.join(output_dir, 'favicon.ico'),
        format='ICO',
        sizes=ico_sizes
    )
    
    # Save common sizes
    favicons[192].save(os.path.join(output_dir, 'android-chrome-192x192.png'))
    favicons[512].save(os.path.join(output_dir, 'android-chrome-512x512.png'))
    favicons[180].save(os.path.join(output_dir, 'apple-touch-icon.png'))
    
    print(f"✅ Favicons generated successfully in {output_dir}")
    print("\nGenerated files:")
    for file in sorted(os.listdir(output_dir)):
        if file.startswith(('favicon', 'android', 'apple')):
            print(f"  - {file}")

def main():
    # Generate favicons
    print("🎨 Generating Fameuxarte favicons...")
    favicons = create_favicon_from_text()
    
    # Save to public directory
    output_dir = os.path.join(os.path.dirname(__file__), 'public')
    save_favicons(favicons, output_dir)
    
    print("\n📝 Next steps:")
    print("1. The favicons have been saved to the 'public' folder")
    print("2. Update your index.html to reference the new favicon files")
    print("3. Consider adding a manifest.json for PWA support")

if __name__ == "__main__":
    # Add size 180 and 192 to the list
    main()
