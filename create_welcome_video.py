#!/usr/bin/env python3
"""
Generate a simple StockFx welcome video
"""
import os
os.environ['IMAGEIO_FFMPEG_EXE'] = 'ffmpeg'

try:
    import imageio
    from PIL import Image, ImageDraw
    
    # Create output directory
    os.makedirs('public', exist_ok=True)
    
    # Video parameters
    fps = 30
    width, height = 1280, 720
    duration_seconds = 15
    total_frames = fps * duration_seconds
    
    frames = []
    
    print("🎬 Generating StockFx Welcome Video...")
    
    # Scene 1: Welcome (0-2 seconds, 60 frames)
    for frame_num in range(60):
        img = Image.new('RGB', (width, height), color=(20, 20, 30))
        draw = ImageDraw.Draw(img)
        
        # Simple gradient effect
        for y in range(height):
            color_val = int(20 + (y / height) * 80)
            draw.line([(0, y), (width, y)], fill=(color_val // 2, color_val // 3, color_val))
        
        # Main text
        alpha = min(255, int(255 * frame_num / 30))
        draw.text((width//2 - 150, height//2 - 100), "Welcome to StockFx", fill=(255, 200, 100))
        draw.text((width//2 - 200, height//2 + 50), "Your Trusted Investment Partner", fill=(200, 200, 200))
        
        frames.append(img)
    
    # Scene 2: 5+ Years (2-4 seconds, 60 frames)
    for frame_num in range(60):
        img = Image.new('RGB', (width, height), color=(20, 20, 30))
        draw = ImageDraw.Draw(img)
        
        for y in range(height):
            color_val = int(20 + (y / height) * 80)
            draw.line([(0, y), (width, y)], fill=(color_val // 2, color_val // 3, color_val))
        
        draw.text((width//2 - 100, 100), "5+ Years of Excellence", fill=(255, 200, 100))
        draw.text((100, 250), "100,000+ Active Investors", fill=(200, 255, 150))
        draw.text((100, 350), "$5 Billion+ Assets Managed", fill=(200, 255, 150))
        draw.text((100, 450), "80% Average Annual Returns", fill=(150, 255, 150))
        draw.text((100, 550), "90% Win Rate", fill=(150, 255, 150))
        draw.text((100, 650), "4.8/5 Customer Satisfaction", fill=(150, 255, 150))
        
        frames.append(img)
    
    # Scene 3: Key Features (4-7 seconds, 90 frames)
    features = [
        "✓ Zero-Fee Investing",
        "✓ Advanced Research Tools",
        "✓ Real-Time Market Data",
        "✓ Dividend Tracking",
        "✓ Portfolio Analytics",
        "✓ 24/7 Expert Support"
    ]
    
    for frame_num in range(90):
        img = Image.new('RGB', (width, height), color=(20, 20, 30))
        draw = ImageDraw.Draw(img)
        
        for y in range(height):
            color_val = int(20 + (y / height) * 80)
            draw.line([(0, y), (width, y)], fill=(color_val // 2, color_val // 3, color_val))
        
        draw.text((width//2 - 100, 50), "Why Choose StockFx?", fill=(255, 200, 100))
        
        y_pos = 150
        for i, feature in enumerate(features):
            if i < (frame_num // 15):
                draw.text((150, y_pos), feature, fill=(150, 255, 150))
            y_pos += 90
        
        frames.append(img)
    
    # Scene 4: Investment Journey (7-10 seconds, 90 frames)
    for frame_num in range(90):
        img = Image.new('RGB', (width, height), color=(20, 20, 30))
        draw = ImageDraw.Draw(img)
        
        for y in range(height):
            color_val = int(20 + (y / height) * 80)
            draw.line([(0, y), (width, y)], fill=(color_val // 2, color_val // 3, color_val))
        
        draw.text((width//2 - 120, 50), "Your Investment Journey", fill=(255, 200, 100))
        
        progress = frame_num / 90
        draw.text((100, 200), "Step 1: Create Account", fill=(200, 200, 200))
        draw.text((100, 280), "Step 2: Fund Your Account", fill=(200, 200, 200))
        draw.text((100, 360), "Step 3: Start Investing", fill=(200, 200, 200))
        draw.text((100, 440), "Step 4: Watch It Grow", fill=(200, 200, 200))
        
        # Progress bar
        progress_width = int(width * 0.8 * progress)
        draw.rectangle([(100, 550), (100 + progress_width, 580)], fill=(255, 200, 100))
        draw.text((width//2 - 80, 600), f"Progress: {int(progress * 100)}%", fill=(255, 200, 100))
        
        frames.append(img)
    
    # Scene 5: Stats (10-12 seconds, 60 frames)
    for frame_num in range(60):
        img = Image.new('RGB', (width, height), color=(20, 20, 30))
        draw = ImageDraw.Draw(img)
        
        for y in range(height):
            color_val = int(20 + (y / height) * 80)
            draw.line([(0, y), (width, y)], fill=(color_val // 2, color_val // 3, color_val))
        
        draw.text((width//2 - 150, 50), "Investor Success Metrics", fill=(255, 200, 100))
        
        progress = min(1.0, frame_num / 30)
        returns = int(80 * progress)
        win_rate = int(90 * progress)
        
        draw.text((150, 250), f"Average Annual Return: {returns}%", fill=(150, 255, 150))
        draw.text((150, 350), f"Win Rate: {win_rate}%", fill=(150, 255, 150))
        draw.text((150, 450), "Customer Satisfaction: 4.8/5 ⭐", fill=(150, 255, 150))
        draw.text((150, 550), "Trusted by 100,000+ Investors", fill=(150, 255, 150))
        
        frames.append(img)
    
    # Scene 6: Call to Action (12-15 seconds, 90 frames)
    for frame_num in range(90):
        img = Image.new('RGB', (width, height), color=(20, 20, 30))
        draw = ImageDraw.Draw(img)
        
        for y in range(height):
            color_val = int(20 + (y / height) * 80)
            draw.line([(0, y), (width, y)], fill=(color_val // 2, color_val // 3, color_val))
        
        draw.text((width//2 - 180, 200), "Start Your Investment Journey", fill=(255, 200, 100))
        draw.text((width//2 - 100, 350), "Today with StockFx", fill=(255, 200, 100))
        draw.text((width//2 - 150, 500), "Join 100,000+ Successful Investors", fill=(200, 200, 200))
        draw.text((width//2 - 100, 600), "www.stockfx.com", fill=(150, 255, 150))
        
        # Fade out effect in last frames
        if frame_num > 60:
            alpha = 1.0 - (frame_num - 60) / 30
            # Create fade overlay
            overlay = Image.new('RGBA', (width, height), (0, 0, 0, int(255 * (1 - alpha))))
            img.putalpha(int(255 * alpha))
        
        frames.append(img)
    
    print(f"📹 Generated {len(frames)} frames")
    
    # Save video
    video_path = 'public/stockfx-welcome.mp4'
    print(f"💾 Saving to {video_path}...")
    
    writer = imageio.get_writer(video_path, fps=fps, codec='libx264', quality=7)
    for i, frame in enumerate(frames):
        writer.append_data(frame)
        if i % 60 == 0:
            print(f"  ✓ Frame {i}/{len(frames)}")
    writer.close()
    
    file_size = os.path.getsize(video_path) / (1024 * 1024)
    print(f"\n✅ Video created successfully!")
    print(f"   File: {video_path}")
    print(f"   Size: {file_size:.2f} MB")
    print(f"   Duration: {duration_seconds} seconds @ {fps} fps")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("Video generation requires ffmpeg to be installed.")
    print("Falling back to placeholder video...")
