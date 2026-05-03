import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { Tag } from '../types';

type TagPickerProps = {
  tags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  onCreateTag: (name: string) => Promise<Tag>;
};

export function TagPicker({ tags, selectedTagIds, onChange, onCreateTag }: TagPickerProps) {
  const [newTagName, setNewTagName] = useState('');

  function toggleTag(tagId: string) {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
      return;
    }

    onChange([...selectedTagIds, tagId]);
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) {
      return;
    }

    const tag = await onCreateTag(newTagName);
    onChange([...new Set([...selectedTagIds, tag.id])]);
    setNewTagName('');
  }

  return (
    <div className="tag-picker">
      <div className="tag-options">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            className={`tag-option${selectedTagIds.includes(tag.id) ? ' selected' : ''}`}
            style={{ '--tag-color': tag.color } as CSSProperties}
            onClick={() => toggleTag(tag.id)}
          >
            {tag.name}
          </button>
        ))}
      </div>
      <div className="inline-create">
        <input
          value={newTagName}
          onChange={(event) => setNewTagName(event.target.value)}
          placeholder="新建标签"
        />
        <button type="button" className="secondary-button" onClick={handleCreateTag}>
          新建
        </button>
      </div>
    </div>
  );
}
