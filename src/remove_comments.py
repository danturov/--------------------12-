#!/usr/bin/env python3
import re
import os
import shutil
from pathlib import Path

def remove_js_comments(content):
    """Удаляет однострочные и многострочные комментарии из JS/JSX файлов"""
    def replacer(match):
        s = match.group(0)
        if s.startswith('/'):
            return " "
        else:
            return s
    
    pattern = re.compile(
        r'//.*?$|/\*.*?\*/|\'(?:\\.|[^\\\'])*\'|"(?:\\.|[^\\"])*"',
        re.DOTALL | re.MULTILINE
    )
    
    result = re.sub(pattern, replacer, content)
    
    lines = result.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.rstrip()
        if stripped or (not stripped and cleaned_lines and cleaned_lines[-1]):
            cleaned_lines.append(line.rstrip())
    
    while cleaned_lines and not cleaned_lines[-1].strip():
        cleaned_lines.pop()
    
    return '\n'.join(cleaned_lines) + '\n' if cleaned_lines else ''

def remove_css_comments(content):
    """Удаляет комментарии из CSS файлов"""
    pattern = re.compile(r'/\*.*?\*/', re.DOTALL)
    result = re.sub(pattern, '', content)
    
    lines = result.split('\n')
    cleaned_lines = [line.rstrip() for line in lines if line.strip()]
    
    return '\n'.join(cleaned_lines) + '\n' if cleaned_lines else ''

def process_file_inplace(file_path, backup=True):
    """Обрабатывает файл на месте (перезаписывает оригинал)"""
    ext = file_path.suffix.lower()
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        if ext == '.css':
            cleaned_content = remove_css_comments(original_content)
        elif ext in ['.js', '.jsx']:
            cleaned_content = remove_js_comments(original_content)
        else:
            return False, "Неподдерживаемый формат"
        
        if cleaned_content == original_content:
            return False, "Без изменений"
        
        if backup:
            backup_path = file_path.with_suffix(file_path.suffix + '.backup')
            shutil.copy2(file_path, backup_path)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)
        
        return True, "Обработан"
        
    except Exception as e:
        return False, f"Ошибка: {str(e)}"

def find_and_process_files(directory, extensions=None, backup=True, exclude_dirs=None):
    """
    Находит и обрабатывает все файлы с указанными расширениями
    
    Args:
        directory: путь к папке для обработки
        extensions: список расширений (по умолчанию ['.js', '.jsx', '.css'])
        backup: создавать ли резервные копии
        exclude_dirs: список папок для исключения
    """
    if extensions is None:
        extensions = ['.js', '.jsx', '.css']
    
    if exclude_dirs is None:
        exclude_dirs = ['node_modules', '.git', 'build', 'dist', '__pycache__']
    
    directory = Path(directory).resolve()
    
    if not directory.exists():
        print(f"❌ Ошибка: директория {directory} не найдена")
        return
    
    print(f"🔍 Поиск файлов в: {directory}")
    print(f"📝 Расширения: {', '.join(extensions)}")
    print(f"💾 Резервные копии: {'Да' if backup else 'Нет'}")
    print("=" * 70)
    
    files_to_process = []
    
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            file_path = Path(root) / file
            if file_path.suffix.lower() in extensions:
                files_to_process.append(file_path)
    
    if not files_to_process:
        print("⚠️  Файлы не найдены")
        return
    
    print(f"📂 Найдено файлов: {len(files_to_process)}\n")
    
    processed = 0
    skipped = 0
    errors = 0
    
    for file_path in files_to_process:
        rel_path = file_path.relative_to(directory)
        success, message = process_file_inplace(file_path, backup)
        
        if success:
            print(f"✓ {rel_path}")
            processed += 1
        elif message == "Без изменений":
            print(f"○ {rel_path} (без комментариев)")
            skipped += 1
        else:
            print(f"✗ {rel_path} - {message}")
            errors += 1
    
    print("=" * 70)
    print(f"✅ Обработано: {processed}")
    print(f"○  Пропущено (без изменений): {skipped}")
    if errors > 0:
        print(f"❌ Ошибок: {errors}")
    
    if backup and processed > 0:
        print(f"\n💾 Резервные копии сохранены с расширением .backup")
        print(f"   Для удаления резервных копий выполните:")
        print(f"   find {directory} -name '*.backup' -delete")

def restore_backups(directory):
    """Восстанавливает файлы из резервных копий"""
    directory = Path(directory).resolve()
    backup_files = list(directory.rglob('*.backup'))
    
    if not backup_files:
        print("⚠️  Резервные копии не найдены")
        return
    
    print(f"🔄 Найдено резервных копий: {len(backup_files)}")
    response = input("Восстановить все файлы из резервных копий? (yes/no): ")
    
    if response.lower() in ['yes', 'y', 'да', 'д']:
        restored = 0
        for backup_path in backup_files:
            original_path = backup_path.with_suffix('')
            try:
                shutil.copy2(backup_path, original_path)
                backup_path.unlink()
                print(f"✓ Восстановлен: {original_path.name}")
                restored += 1
            except Exception as e:
                print(f"✗ Ошибка при восстановлении {original_path.name}: {e}")
        
        print(f"\n✅ Восстановлено файлов: {restored}")
    else:
        print("Отмена")

def delete_backups(directory):
    """Удаляет все резервные копии"""
    directory = Path(directory).resolve()
    backup_files = list(directory.rglob('*.backup'))
    
    if not backup_files:
        print("⚠️  Резервные копии не найдены")
        return
    
    print(f"🗑️  Найдено резервных копий: {len(backup_files)}")
    response = input("Удалить все резервные копии? (yes/no): ")
    
    if response.lower() in ['yes', 'y', 'да', 'д']:
        deleted = 0
        for backup_path in backup_files:
            try:
                backup_path.unlink()
                deleted += 1
            except Exception as e:
                print(f"✗ Ошибка при удалении {backup_path.name}: {e}")
        
        print(f"✅ Удалено резервных копий: {deleted}")
    else:
        print("Отмена")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("╔════════════════════════════════════════════════════════════════╗")
        print("║         Удаление комментариев из JS/JSX/CSS файлов             ║")
        print("╚════════════════════════════════════════════════════════════════╝")
        print("\nИспользование:")
        print("  python remove_comments.py <папка> [опции]\n")
        print("Режимы:")
        print("  python remove_comments.py ./src")
        print("    → Обработать все файлы (с резервными копиями)")
        print()
        print("  python remove_comments.py ./src --no-backup")
        print("    → Обработать без создания резервных копий")
        print()
        print("  python remove_comments.py ./src --restore")
        print("    → Восстановить файлы из резервных копий")
        print()
        print("  python remove_comments.py ./src --delete-backups")
        print("    → Удалить все резервные копии")
        print()
        print("  python remove_comments.py ./src --extensions .js .jsx")
        print("    → Обработать только указанные расширения")
        print()
        sys.exit(1)
    
    target_dir = sys.argv[1]
    
    if '--restore' in sys.argv:
        restore_backups(target_dir)
    elif '--delete-backups' in sys.argv:
        delete_backups(target_dir)
    else:
        backup = '--no-backup' not in sys.argv
        
        extensions = ['.js', '.jsx', '.css']
        if '--extensions' in sys.argv:
            ext_index = sys.argv.index('--extensions')
            extensions = []
            for i in range(ext_index + 1, len(sys.argv)):
                if sys.argv[i].startswith('--'):
                    break
                extensions.append(sys.argv[i] if sys.argv[i].startswith('.') else f'.{sys.argv[i]}')
        
        find_and_process_files(target_dir, extensions=extensions, backup=backup)