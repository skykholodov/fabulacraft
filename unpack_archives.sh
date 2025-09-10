#!/usr/bin/env bash
set -euo pipefail

# unpack_archives.sh
# Находит архивы в репозитории и распаковывает их в ./extracted/<relative-path>/<archive-name>/
# Поддерживаются: .zip, .tar, .tar.gz, .tgz, .tar.bz2, .tar.xz, .tar, .rar, .7z
# Требует: unzip, tar, (unrar | 7z) для rar/7z

repo_root="$(pwd)"
echo "Работаю в каталоге: $repo_root"

found=0

while IFS= read -r -d '' file; do
  found=1
  rel="${file#./}"
  dir_rel="$(dirname "$rel")"
  base="$(basename "$file")"

  # имя архива без составных расширений
  if [[ "$base" == *.tar.gz ]]; then
    name="${base%.tar.gz}"
  elif [[ "$base" == *.tar.bz2 ]]; then
    name="${base%.tar.bz2}"
  elif [[ "$base" == *.tar.xz ]]; then
    name="${base%.tar.xz}"
  elif [[ "$base" == *.tgz ]]; then
    name="${base%.tgz}"
  else
    name="${base%.*}"
  fi

  outdir="$repo_root/extracted/$dir_rel/$name"
  mkdir -p "$outdir"
  echo
  echo "Распаковка: $file -> $outdir"

  case "${file,,}" in
    *.zip)
      if command -v unzip >/dev/null 2>&1; then
        unzip -o "$file" -d "$outdir"
      else
        echo "Ошибка: unzip не установлен."
        exit 2
      fi
      ;;
    *.tar.gz|*.tgz)
      tar -xzf "$file" -C "$outdir"
      ;;
    *.tar.bz2)
      tar -xjf "$file" -C "$outdir"
      ;;
    *.tar.xz)
      tar -xJf "$file" -C "$outdir"
      ;;
    *.tar)
      tar -xf "$file" -C "$outdir"
      ;;
    *.rar)
      if command -v unrar >/dev/null 2>&1; then
        unrar x -o+ "$file" "$outdir"/
      elif command -v 7z >/dev/null 2>&1; then
        7z x -y -o"$outdir" "$file"
      else
        echo "Ошибка: ни unrar, ни 7z не установлены. Нельзя распаковать rar."
        exit 2
      fi
      ;;
    *.7z)
      if command -v 7z >/dev/null 2>&1; then
        7z x -y -o"$outdir" "$file"
      else
        echo "Ошибка: 7z не установлен."
        exit 2
      fi
      ;;
    *)
      echo "Пропускаю неподдерживаемый тип: $file"
      ;;
  esac

done < <(find . -type f \( -iname "*.zip" -o -iname "*.tar" -o -iname "*.tar.gz" -o -iname "*.tgz" -o -iname "*.tar.bz2" -o -iname "*.tar.xz" -o -iname "*.rar" -o -iname "*.7z" \) -print0)

if [[ $found -eq 0 ]]; then
  echo "Архивы не найдены."
else
  echo
  echo "Готово. Все найденные архивы распакованы в ./extracted/"
fi
