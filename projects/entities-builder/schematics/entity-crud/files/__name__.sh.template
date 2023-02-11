#!/bin/bash
# Define la variable para contar las líneas continuas con solo espacios o saltos de línea
contador=0
# Busca recursivamente todos los archivos en el directorio actual
for archivo in $(find . -type f); do
  # Verifica cada línea del archivo
  awk '
  {
    # Si la línea está vacía
    if ($0 ~ /^[[:space:]]*$/) {
      # Aumenta el contador de líneas vacías
      contador++;
    }
    else {
      # Si el contador de líneas vacías es mayor a 1
      if (contador > 1) {
        # Imprime las primeras 1 líneas vacías
        for (i=1; i<=1; i++) {
          print "";
        }
      }
      # Imprime la línea actual
      print $0;
      # Reinicia el contador de líneas vacías
      contador=0;
    }
  }' "$archivo" > "$archivo".tmp
  # Reemplaza el archivo original con el archivo temporal
  mv "$archivo".tmp "$archivo"
done
