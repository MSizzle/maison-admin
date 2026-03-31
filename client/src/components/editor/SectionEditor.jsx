import ColorPicker from './ColorPicker';
import FontControls from './FontControls';
import ImageUploader from './ImageUploader';

export default function SectionEditor({ config, activeSection, onUpdate }) {
  if (!activeSection) return <p className="text-gray-500 text-sm">Select a section to edit</p>;

  // Global styles editor
  if (activeSection === '_global') {
    return (
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-gray-200">Global Colors</h3>
        {Object.entries(config.colors || {}).map(([key, value]) => (
          <div key={key}>
            <label className="block text-xs text-gray-400 mb-1.5 capitalize">{key}</label>
            <ColorPicker
              color={value}
              onChange={(c) =>
                onUpdate((prev) => ({ ...prev, colors: { ...prev.colors, [key]: c } }))
              }
            />
          </div>
        ))}

        <hr className="border-gray-800" />
        <h3 className="text-sm font-semibold text-gray-200">Typography</h3>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Heading Font</label>
          <FontControls
            font={config.fonts?.heading}
            onChange={(f) =>
              onUpdate((prev) => ({ ...prev, fonts: { ...prev.fonts, heading: f } }))
            }
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Body Font</label>
          <FontControls
            font={config.fonts?.body}
            onChange={(f) =>
              onUpdate((prev) => ({ ...prev, fonts: { ...prev.fonts, body: f } }))
            }
          />
        </div>

        <hr className="border-gray-800" />
        <h3 className="text-sm font-semibold text-gray-200">Images</h3>
        {Object.entries(config.images || {}).map(([key, value]) => (
          <div key={key}>
            <label className="block text-xs text-gray-400 mb-1.5 capitalize">{key.replace(/_/g, ' ')}</label>
            <ImageUploader
              currentImage={value}
              onUpload={(path) =>
                onUpdate((prev) => ({ ...prev, images: { ...prev.images, [key]: path } }))
              }
            />
          </div>
        ))}
      </div>
    );
  }

  // Section-specific editor
  const sectionIndex = config.sections?.findIndex((s) => s.id === activeSection);
  const section = config.sections?.[sectionIndex];
  if (!section) return <p className="text-gray-500 text-sm">Section not found</p>;

  function updateField(field, value) {
    onUpdate((prev) => {
      const sections = [...prev.sections];
      sections[sectionIndex] = { ...sections[sectionIndex], [field]: value };
      return { ...prev, sections };
    });
  }

  function updateItem(itemIndex, field, value) {
    onUpdate((prev) => {
      const sections = [...prev.sections];
      const items = [...(sections[sectionIndex].items || [])];
      items[itemIndex] = { ...items[itemIndex], [field]: value };
      sections[sectionIndex] = { ...sections[sectionIndex], items };
      return { ...prev, sections };
    });
  }

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-gray-200 capitalize">{section.type} Section</h3>

      {/* Text fields */}
      {section.headline !== undefined && (
        <Field label="Headline" value={section.headline} onChange={(v) => updateField('headline', v)} />
      )}
      {section.subheadline !== undefined && (
        <Field label="Subheadline" value={section.subheadline} onChange={(v) => updateField('subheadline', v)} />
      )}
      {section.body !== undefined && (
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Body Text</label>
          <textarea
            value={section.body}
            onChange={(e) => updateField('body', e.target.value)}
            rows={4}
            className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-accent focus:outline-none resize-none"
          />
        </div>
      )}
      {section.cta_text !== undefined && (
        <Field label="Button Text" value={section.cta_text} onChange={(v) => updateField('cta_text', v)} />
      )}
      {section.cta_link !== undefined && (
        <Field label="Button Link" value={section.cta_link} onChange={(v) => updateField('cta_link', v)} />
      )}
      {section.text !== undefined && (
        <Field label="Text" value={section.text} onChange={(v) => updateField('text', v)} />
      )}

      {/* Background color */}
      {section.background_color !== undefined && (
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Background Color</label>
          <ColorPicker
            color={section.background_color}
            onChange={(c) => updateField('background_color', c)}
          />
        </div>
      )}

      {/* Background image */}
      {section.background_image !== undefined && (
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Background Image</label>
          <ImageUploader
            currentImage={section.background_image}
            onUpload={(path) => updateField('background_image', path)}
          />
        </div>
      )}

      {/* Items (features, etc.) */}
      {section.items && (
        <div>
          <label className="block text-xs text-gray-400 mb-2">Items</label>
          <div className="space-y-3">
            {section.items.map((item, i) => (
              <div key={i} className="bg-dark-800 rounded-lg p-3 space-y-2">
                <Field
                  label="Title"
                  value={item.title || ''}
                  onChange={(v) => updateItem(i, 'title', v)}
                  small
                />
                <Field
                  label="Description"
                  value={item.description || ''}
                  onChange={(v) => updateItem(i, 'description', v)}
                  small
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, small }) {
  return (
    <div>
      <label className={`block text-gray-400 mb-1 ${small ? 'text-[10px]' : 'text-xs'}`}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:border-accent focus:outline-none"
      />
    </div>
  );
}
