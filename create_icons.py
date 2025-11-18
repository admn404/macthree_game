#!/usr/bin/env python3
"""
Скрипт для создания простых иконок для PWA
Требует установленный Pillow: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Ошибка: Pillow не установлен.")
    print("Установите его командой: pip install Pillow")
    exit(1)

def create_icon(size, filename):
    """Создает простую иконку с текстом MacThree"""
    # Создаем изображение с черным фоном
    img = Image.new('RGB', (size, size), color='#000000')
    draw = ImageDraw.Draw(img)
    
    # Рисуем рамку
    border = size // 10
    draw.rectangle([border, border, size - border, size - border], 
                   outline='#ffffff', width=border // 2)
    
    # Пытаемся использовать системный шрифт, если не получается - используем дефолтный
    try:
        # Для Windows
        font_size = size // 4
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            try:
                # Для Linux
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
            except:
                # Дефолтный шрифт
                font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Рисуем текст "M3" (MacThree)
    text = "M3"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size - text_width) // 2, (size - text_height) // 2)
    draw.text(position, text, fill='#ffffff', font=font)
    
    # Сохраняем
    img.save(filename, 'PNG')
    print(f"✓ Создана иконка: {filename} ({size}x{size})")

def main():
    print("Создание иконок для MacThree PWA...")
    create_icon(192, 'icon-192.png')
    create_icon(512, 'icon-512.png')
    print("\nГотово! Иконки созданы.")
    print("Теперь можно обновить страницу в браузере.")

if __name__ == '__main__':
    main()

