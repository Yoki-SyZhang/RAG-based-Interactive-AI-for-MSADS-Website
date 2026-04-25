import os
import json
import re
import glob

def remove_markdown_links(text):
    # Matches [text](url) and captures 'text' in group 1
    return re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)

directory = 'data/cleaned_sections'
json_files = glob.glob(os.path.join(directory, '*.json'))

modified_count = 0

for filepath in json_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print(f"Error decoding JSON in {filepath}")
            continue
            
    changed = False
    if 'structured_sections' in data:
        for section in data['structured_sections']:
            if 'text_markdown' in section:
                original_text = section['text_markdown']
                new_text = remove_markdown_links(original_text)
                if original_text != new_text:
                    section['text_markdown'] = new_text
                    changed = True
                    
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            # maintain formatting
            json.dump(data, f, indent=2, ensure_ascii=False)
            # Add a newline at the end of the file as is typical
            f.write('\n')
        modified_count += 1

print(f"Successfully processed {len(json_files)} files. Modified {modified_count} files.")
