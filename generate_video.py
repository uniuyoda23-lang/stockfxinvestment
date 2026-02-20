import imageio
from PIL import Image, ImageDraw, ImageFont
import os
from pathlib import Path

# Create frames for the welcome video
output_dir = Path("public")
output_dir.mkdir(exist_ok=True)
video_path = output_dir / "stockfx-welcome.mp4"

frames = []
fps = 30
duration = 15  # 15 second video

# Frame 1-2 seconds: Welcome text (60 frames)
for i in range(60):
    img = Image.new('RGB', (1920, 1080), color=(10, 10, 15))
    draw = ImageDraw.Draw(img)
    
    # Gradient background effect
    for y in range(1080):
        r = int(10 + (y / 1080) * 100)
        g = int(10 + (y / 1080) * 80)
        b = int(15 + (y / 1080) * 60)
        draw.line([(0, y), (1920, y)], fill=(r, g, b))
    
    # Fade in welcome text
    alpha = min(1.0, i / 30)
    opacity = int(255 * alpha)
    
    # Draw main title - Welcome to StockFx
    title_text = "Welcome to StockFx"
    font_large = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), title_text, font=font_large)
    text_width = bbox[2] - bbox[0]
    x_pos = (1920 - text_width) // 2
    draw.text((x_pos, 300), title_text, fill=(255, 200, 100, opacity), font=font_large)
    
    frames.append(img)

# Frame 2-4 seconds: Company intro (60 frames)
for i in range(60):
    img = Image.new('RGB', (1920, 1080), color=(10, 10, 15))
    draw = ImageDraw.Draw(img)
    
    # Gradient background
    for y in range(1080):
        r = int(10 + (y / 1080) * 100)
        g = int(10 + (y / 1080) * 80)
        b = int(15 + (y / 1080) * 60)
        draw.line([(0, y), (1920, y)], fill=(r, g, b))
    
    # Draw welcome message
    welcome_text = "Your Trusted Partner in Investment Success"
    draw.text((100, 250), welcome_text, fill=(200, 200, 200), font=font_large)
    
    # Draw stats
    stats_text = [
        "5+ Years of Excellence",
        "100,000+ Active Investors",
        "$5 Billion+ Assets Managed"
    ]
    
    y_offset = 450
    for stat in stats_text:
        draw.text((200, y_offset), stat, fill=(255, 200, 100), font=font_large)
        y_offset += 150
    
    frames.append(img)

# Frame 4-7 seconds: Key features (90 frames)
features = [
    "✓ Zero-Fee Investing",
    "✓ Advanced Research Tools",
    "✓ Real-Time Market Data",
    "✓ Dividend Tracking",
    "✓ Portfolio Analytics",
    "✓ Expert Support"
]

for i in range(90):
    img = Image.new('RGB', (1920, 1080), color=(10, 10, 15))
    draw = ImageDraw.Draw(img)
    
    # Gradient background
    for y in range(1080):
        r = int(10 + (y / 1080) * 100)
        g = int(10 + (y / 1080) * 80)
        b = int(15 + (y / 1080) * 60)
        draw.line([(0, y), (1920, y)], fill=(r, g, b))
    
    # Title
    draw.text((100, 150), "Why Choose StockFx?", fill=(255, 200, 100), font=font_large)
    
    # Features
    y_offset = 350
    for j, feature in enumerate(features):
        if j < (i // 15):  # Stagger appearance
            draw.text((250, y_offset), feature, fill=(150, 255, 150), font=font_large)
        y_offset += 100
    
    frames.append(img)

# Frame 7-10 seconds: Investment journey (90 frames)
for i in range(90):
    img = Image.new('RGB', (1920, 1080), color=(10, 10, 15))
    draw = ImageDraw.Draw(img)
    
    # Gradient background
    for y in range(1080):
        r = int(10 + (y / 1080) * 100)
        g = int(10 + (y / 1080) * 80)
        b = int(15 + (y / 1080) * 60)
        draw.line([(0, y), (1920, y)], fill=(r, g, b))
    
    # Title
    draw.text((100, 150), "Your Investment Journey", fill=(255, 200, 100), font=font_large)
    
    # Journey steps
    progress = min(1.0, i / 90)
    steps = [
        ("Step 1", "Create Account", 300),
        ("Step 2", "Fund Your Account", 500),
        ("Step 3", "Start Investing", 700),
        ("Step 4", "Watch It Grow", 900)
    ]
    
    step_width = int(1800 * progress)
    draw.rectangle([(100, 950), (100 + step_width, 980)], fill=(255, 200, 100))
    
    for title, desc, y_pos in steps:
        draw.text((300, y_pos), f"{title}: {desc}", fill=(200, 200, 200), font=font_large)
    
    frames.append(img)

# Frame 10-12 seconds: Growth stats (60 frames)
for i in range(60):
    img = Image.new('RGB', (1920, 1080), color=(10, 10, 15))
    draw = ImageDraw.Draw(img)
    
    # Gradient background
    for y in range(1080):
        r = int(10 + (y / 1080) * 100)
        g = int(10 + (y / 1080) * 80)
        b = int(15 + (y / 1080) * 60)
        draw.line([(0, y), (1920, y)], fill=(r, g, b))
    
    # Title
    draw.text((100, 150), "Investor Success Metrics", fill=(255, 200, 100), font=font_large)
    
    # Stats
    progress = min(1.0, i / 60)
    avg_return = int(80 * progress)
    win_rate = int(90 * progress)
    
    draw.text((300, 400), f"Average Annual Return: {avg_return}%", fill=(150, 255, 150), font=font_large)
    draw.text((300, 600), f"Win Rate: {win_rate}%", fill=(150, 255, 150), font=font_large)
    draw.text((300, 800), f"Customer Satisfaction: 4.8/5 ⭐", fill=(150, 255, 150), font=font_large)
    
    frames.append(img)

# Frame 12-15 seconds: Call to action (90 frames)
for i in range(90):
    img = Image.new('RGB', (1920, 1080), color=(10, 10, 15))
    draw = ImageDraw.Draw(img)
    
    # Gradient background
    for y in range(1080):
        r = int(10 + (y / 1080) * 100)
        g = int(10 + (y / 1080) * 80)
        b = int(15 + (y / 1080) * 60)
        draw.line([(0, y), (1920, y)], fill=(r, g, b))
    
    # Fade effect
    alpha = max(0.5, 1.0 - (i - 60) / 30) if i > 60 else 1.0
    
    # Main CTA
    draw.text((400, 300), "Start Your Investment Journey Today", fill=(255, 200, 100), font=font_large)
    draw.text((500, 600), "Visit StockFx.com", fill=(200, 200, 200), font=font_large)
    draw.text((350, 800), "5+ Years of Trusted Investment Excellence", fill=(150, 255, 150), font=font_large)
    
    frames.append(img)

# Add 2 seconds of black (60 frames)
for _ in range(60):
    img = Image.new('RGB', (1920, 1080), color=(0, 0, 0))
    frames.append(img)

print(f"Total frames: {len(frames)}")
print(f"Video duration: {len(frames) / fps} seconds")
print("Creating video...")

# Write video
writer = imageio.get_writer(str(video_path), fps=fps, codec='libx264')
for frame in frames:
    writer.append_data(frame)
writer.close()

print(f"✓ Video created successfully: {video_path}")
print(f"File size: {os.path.getsize(video_path) / (1024*1024):.2f} MB")
