#!/bin/bash
for fullfile in ./*; do
    filename=$(basename -- "$fullfile")
    extension="${filename##*.}"
    filename="${filename%.*}"
    if [ $extension = "dot" ]
    then
        echo $extension
        rm  $filename.pdf
        dot -Tpdf $fullfile -o $filename.pdf
    fi
done